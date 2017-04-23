import Ember from 'ember';
import Peer from './peer';

export default Peer.extend({
  init() {
    this.set('local_ips', []);
    this._super();
  },

  local_ip: Ember.computed('local_ips.[]', {
    get() {
      const ips = this.get('local_ips');
      const storedIp = localStorage.getItem('local_ip');

      if (storedIp && ips.includes(storedIp)) {
        return storedIp;
      }
      return ips[0] || null;
    },

    set(key, value) {
      const ips = this.get('local_ips');

      if (value && ips.includes(value)) {
        localStorage.setItem('local_ip', value);
      }

      return value;
    },
  }),

  label: Ember.computed('email', 'local_ip', function () {
    const email = this.get('email');
    const localIP = this.get('local_ip');
    let label;

    if (email && localIP) {
      label = `${email} (${localIP})`;
    } else if (localIP) {
      label = localIP;
    } else if (email) {
      label = email;
    } else {
      label = null;
    }

    return label;
  }),

  labelWithPublicIp: Ember.computed('email', 'public_ip', 'local_ip', function () {
    const email = this.get('email');
    const publicIP = this.get('public_ip');
    const localIP = this.get('local_ip');
    let label;

    if (email && localIP) {
      label = `${email} (${publicIP}/${localIP})`;
    } else if (localIP) {
      label = `${publicIP}/${localIP}`;
    } else if (email) {
      label = `${email} (${publicIP})`;
    } else {
      label = null;
    }

    return label;
  }),

  serialize() {
    const data = {
      uuid: this.get('uuid'),
      email: this.get('email'),
      public_ip: this.get('public_ip'),
      peer: {
        id: this.get('peer.id'),
      },
    };
    const localIP = this.get('local_ip');

    if (localIP) {
      data.local_ip = localIP;
    }

    return data;
  },

  // Make user"s email available after page reload,
  // by storing it in local storage.
  userEmailDidChange: Ember.observer('email', function () {
    const email = this.get('email');

    if (email) {
      localStorage.email = email;
    } else {
      localStorage.removeItem('email');
    }
  }),
});
