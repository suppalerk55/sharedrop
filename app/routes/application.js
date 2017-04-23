import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    openModal(modalName) {
      return this.render(modalName, {
        outlet: 'modal',
        into: 'application',
      });
    },

    closeModal() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application',
      });
    },
  },
});
