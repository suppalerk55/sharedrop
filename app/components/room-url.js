import Ember from 'ember';

export default Ember.TextField.extend({
  classNames: ['room-url'],

  didInsertElement() {
    this.$().focus().select();
  },

  copyValueToClipboard() {
    if (window.ClipboardEvent) {
      const pasteEvent = new window.ClipboardEvent('paste', {
        dataType: 'text/plain',
        data: this.$().val(),
      });

      document.dispatchEvent(pasteEvent);
    }
  },
});
