import Ember from 'ember';

const equal = Ember.computed.equal;

export default Ember.Component.extend({
  classNames: ['peer'],
  classNameBindings: ['peer.peer.state'],

  peer: null,
  hasCustomRoomName: false,
  webrtc: null, // TODO inject webrtc as a service

  isIdle: equal('peer.state', 'idle'),
  isAwaitingFileInfo: equal('peer.state', 'awaiting_file_info'),
  isAwaitingResponse: equal('peer.state', 'awaiting_response'),
  hasReceivedFileInfo: equal('peer.state', 'received_file_info'),
  hasDeclinedFileTransfer: equal('peer.state', 'declined_file_transfer'),
  hasError: equal('peer.state', 'error'),

  filename: Ember.computed('peer.transfer.file', 'peer.transfer.info', function () {
    const file = this.get('peer.transfer.file');
    const info = this.get('peer.transfer.info');

    if (file) { return file.name; }
    if (info) { return info.name; }

    return null;
  }),

  actions: {
    // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
    uploadFile(data) {
      const peer = this.get('peer');
      const file = data.file;

      // Cache the file, so that it's available
      // when the response from the recipient comes in
      peer.set('transfer.file', file);
      peer.set('state', 'awaiting_file_info');
    },

    sendFileTransferInquiry() {
      const webrtc = this.get('webrtc');
      const peer = this.get('peer');

      webrtc.connect(peer.get('peer.id'));
    },

    cancelFileTransfer() {
      this._cancelFileTransfer();
    },

    abortFileTransfer() {
      this._cancelFileTransfer();

      const webrtc = this.get('webrtc');
      const connection = this.get('peer.peer.connection');

      webrtc.sendCancelRequest(connection);
    },

    acceptFileTransfer() {
      const peer = this.get('peer');

      this._sendFileTransferResponse(true);

      peer.get('peer.connection').on('receiving_progress', (progress) => {
        peer.set('transfer.receivingProgress', progress);
      });

      peer.set('state', 'sending_file_data');
    },

    rejectFileTransfer() {
      const peer = this.get('peer');

      this._sendFileTransferResponse(false);
      peer.set('transfer.info', null);
      peer.set('state', 'idle');
    },
  },

  _cancelFileTransfer() {
    const peer = this.get('peer');

    peer.setProperties({
      'transfer.file': null,
      state: 'idle',
    });
  },

  _sendFileTransferResponse(response) {
    const webrtc = this.get('webrtc');
    const peer = this.get('peer');
    const connection = peer.get('peer.connection');

    webrtc.sendFileResponse(connection, response);
  },

  errorTemplateName: Ember.computed('peer.errorCode', function () {
    const errorCode = this.get('peer.errorCode');

    return errorCode ? `errors/popovers/${errorCode}` : null;
  }),

  label: Ember.computed('hasCustomRoomName', 'peer.label', 'peer.labelWithPublicIp', function () {
    if (this.get('hasCustomRoomName')) {
      return this.get('peer.labelWithPublicIp');
    }

    return this.get('peer.label');
  }),
});
