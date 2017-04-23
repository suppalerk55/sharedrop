import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['peer'],
  classNameBindings: ['peer.peer.state'],

  localIps: Ember.computed('user.local_ips.[]', function () {
    return this.get('user.local_ips').sort();
  }),

  hasManyLocalIps: Ember.computed('localIps.length', function () {
    return this.get('localIps.length') > 1;
  }),
});
