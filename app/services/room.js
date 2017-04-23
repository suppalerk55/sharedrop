import Ember from 'ember';

// TODO: use Ember.Object.extend()
function Room(name, firebaseRef) {
  this._ref = firebaseRef;
  this.name = name;
}

Room.prototype.join = function join(user) {
  const self = this;

  // Setup Firebase refs
  self._connectionRef = self._ref.child('.info/connected');
  self._roomRef = self._ref.child(`rooms/${this.name}`);
  self._usersRef = self._roomRef.child('users');
  self._userRef = self._usersRef.child(user.uuid);

  console.log('Room:\t Connecting to: ', this.name);

  self._connectionRef.on('value', (valueSnaphot) => {
    // Once connected (or reconnected) to Firebase
    if (valueSnaphot.val() === true) {
      console.log('Firebase: (Re)Connected');

      // Remove yourself from the room when disconnected
      self._userRef.onDisconnect().remove();

      // Join the room
      self._userRef.set(user, (error) => {
        if (error) {
          console.warn('Firebase: Adding user to the room failed: ', error);
        } else {
          console.log('Firebase: User added to the room');
          // Create a copy of user data,
          // so that deleting properties won't affect the original variable
          Ember.$.publish('connected.room', Ember.$.extend(true, {}, user));
        }
      });

      self._usersRef.on('child_added', (childAddedSnapshot) => {
        const addedUser = childAddedSnapshot.val();

        console.log('Room:\t user_added: ', addedUser);
        Ember.$.publish('user_added.room', addedUser);
      });

      self._usersRef.on('child_removed', (childRemovedSnapshot) => {
        const removedUser = childRemovedSnapshot.val();

        console.log('Room:\t user_removed: ', removedUser);
        Ember.$.publish('user_removed.room', removedUser);
      }, () => {
        // Handle case when the whole room is removed from Firebase
        Ember.$.publish('disconnected.room');
      });

      self._usersRef.on('child_changed', (childChangedSnapshot) => {
        const changedUser = childChangedSnapshot.val();

        console.log('Room:\t user_changed: ', changedUser);
        Ember.$.publish('user_changed.room', changedUser);
      });
    } else {
      console.log('Firebase: Disconnected');

      Ember.$.publish('disconnected.room');
      self._usersRef.off();
    }
  });

  return this;
};

Room.prototype.update = function update(attrs) {
  this._userRef.update(attrs);
};

Room.prototype.leave = function leave() {
  this._userRef.remove();
  this._usersRef.off();
};

export default Room;
