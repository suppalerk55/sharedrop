/* jshint -W030 */
import Ember from 'ember';
import config from './../config/environment';
import FileSystem from '../services/file';
import Analytics from '../services/analytics';

export function initialize(application) {
  application.deferReadiness();

  checkWebRTCSupport()
    .then(clearFileSystem)
    .catch((error) => {
      application.error = error;
    })
    .then(authenticateToFirebase)
    .then(trackSizeOfReceivedFiles)
    .then(() => {
      application.advanceReadiness();
    });

  function checkWebRTCSupport() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // window.util is a part of PeerJS library
      if (window.util.supports.sctp) {
        resolve();
      } else {
        reject('browser-unsupported');
      }
    });
  }

  function clearFileSystem() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // TODO: change File into a service and require it here
      FileSystem.removeAll()
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject('filesystem-unavailable');
        });
    });
  }

  function authenticateToFirebase() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.getJSON('/auth')
        .then((data) => {
          const ref = new window.Firebase(config.FIREBASE_URL);
          application.ref = ref;
          application.userId = data.id;
          application.publicIp = data.public_ip;

          ref.authWithCustomToken(data.token, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
    });
  }

  // TODO: move it to a separate initializer
  function trackSizeOfReceivedFiles() {
    Ember.$.subscribe('file_received.p2p', (event, data) => {
      Analytics.trackEvent('file', 'received', 'size', Math.round(data.info.size / 1000));
    });
  }
}

export default {
  name: 'prerequisites',
  initialize,
};
