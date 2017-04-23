import Ember from 'ember';
import User from '../models/user';

export default Ember.Controller.extend({
  init() {
    this._super();

    const id = window.ShareDrop.userId;
    const ip = window.ShareDrop.publicIp;
    const you = User.create({
      uuid: id,
      public_ip: ip,
      email: localStorage.email || null,
    });

    you.set('peer.id', id);
    this.set('you', you);
    this.handlePersonaAuth();
  },

  actions: {
    signIn() {
      navigator.id.request();
    },

    signOut() {
      navigator.id.logout();
    },

    redirect() {
      const uuid = Ember.$.uuid();
      const key = `show-instructions-for-room-${uuid}`;

      sessionStorage.setItem(key, 'yup');
      this.transitionToRoute('room', uuid);
    },
  },

  handlePersonaAuth() {
    const self = this;

    navigator.id.watch({
      loggedInUser: this.get('you.email'),

      onlogin(assertion) {
        Ember.$.ajax({
          type: 'POST',
          url: '/persona/verify',
          data: { assertion },
          success(res) {
            console.log(`Persona: Signed in as: "${res.email}"`);

            if (res && res.status === 'okay') {
              self.set('you.email', res.email);
            }
          },
          error(xhr, status, err) {
            console.log('Persona: Signed in error: ', err);
            navigator.id.logout();
          },
        });
      },

      onlogout() {
        Ember.$.ajax({
          type: 'POST',
          url: '/persona/logout',
          success() {
            console.log('Persona: Signed out');
            self.set('you.email', null);
          },
          error(xhr, status, err) {
            console.log('Persona: Sign out error: ', err);
          },
        });
      },
    });
  },
});
