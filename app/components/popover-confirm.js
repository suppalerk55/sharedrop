import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['popover-confirm'],
  isVisible: false,

  iconClass: Ember.computed('filename', function () {
    const filename = this.get('filename');

    if (filename) {
      const regex = /\.([0-9a-z]+)$/i;
      const match = filename.match(regex);
      const extension = match && match[1];

      if (extension) {
        return `glyphicon-${extension.toLowerCase()}`;
      }
    }

    return null;
  }),

  actions: {
    confirm() {
      this.sendAction('confirm');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },
});
