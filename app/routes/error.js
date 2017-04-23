import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate(controller, error) {
    const errors = ['browser-unsupported', 'filesystem-unavailable'];
    const name = `errors/${error.message}`;

    if (errors.indexOf(error.message) !== -1) {
      this.render(name);
    }
  },
});
