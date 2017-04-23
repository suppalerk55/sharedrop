import Ember from 'ember';

function File(options) {
  const self = this;

  this.name = options.name;
  this.localName = `${new Date().getTime()}-${this.name}`;
  this.size = options.size;
  this.type = options.type;

  this._reset();

  return new Ember.RSVP.Promise((resolve, reject) => {
    const requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    requestFileSystem(
      window.TEMPORARY,
      options.size,
      (filesystem) => {
        self.filesystem = filesystem;
        resolve(self);
      },
      (error) => {
        self.errorHandler(error);
        reject(error);
      },
    );
  });
}

File.removeAll = function removeAll() {
  return new Ember.RSVP.Promise((resolve, reject) => {
    const filer = new window.Filer();

    filer.init(
      { persistent: false },
      () => {
        filer.ls('/', (entries) => {
          function rm(entry) {
            if (entry) {
              filer.rm(entry, () => {
                rm(entries.pop());
              });
            } else {
              resolve();
            }
          }

          rm(entries.pop());
        });
      },
      (error) => {
        console.log(error);
        reject(error);
      });
  });
};

File.prototype.append = function append(data) {
  const self = this;
  const options = {
    create: this.create,
  };

  return new Ember.RSVP.Promise((resolve, reject) => {
    self.filesystem.root.getFile(self.localName, options, (fileEntry) => {
      if (self.create) {
        self.create = false;
      }

      self.fileEntry = fileEntry;

      fileEntry.createWriter(
        (writer) => {
          const blob = new Blob(data, { type: self.type });

          // console.log('File: Appending ' + blob.size + ' bytes at ' + self.seek);

          writer.onwriteend = () => {
            self.seek += blob.size;
            resolve(fileEntry);
          };

          writer.onerror = (error) => {
            self.errorHandler(error);
            reject(error);
          };

          writer.seek(self.seek);
          writer.write(blob);
        },
        (error) => {
          self.errorHandler(error);
          reject(error);
        },
      );
    },
    (error) => {
      self.errorHandler(error);
      reject(error);
    });
  });
};

File.prototype.save = function save() {
  const self = this;

  console.log('File: Saving file: ', this.fileEntry);

  const a = document.createElement('a');
  a.download = this.name;

  if (this._isWebKit()) {
    a.href = this.fileEntry.toURL();
    finish(a);
  } else {
    this.fileEntry.file((file) => {
      const URL = window.URL || window.webkitURL;
      a.href = URL.createObjectURL(file);
      finish(a);
    });
  }

  function finish(link) {
    document.body.appendChild(link);
    link.addEventListener('click', () => {
      // Remove file entry from filesystem.
      setTimeout(() => {
        self.remove().then(self._reset.bind(self));
      }, 100); // Hack, but otherwise browser doesn't save the file at all.

      link.parentNode.removeChild(a);
    });

    a.click();
  }
};

File.prototype.errorHandler = function errorHandler(error) {
  console.error('File error: ', error);
};

File.prototype.remove = function remove() {
  const self = this;

  return new Ember.RSVP.Promise((resolve, reject) => {
    self.filesystem.root.getFile(self.localName, { create: false }, (fileEntry) => {
      fileEntry.remove(
        () => {
          console.debug(`File: Removed file: ${self.localName}`);
          resolve(fileEntry);
        },
        (error) => {
          self.errorHandler(error);
          reject(error);
        });
    }, (error) => {
      self.errorHandler(error);
      reject(error);
    });
  });
};

File.prototype._reset = function _reset() {
  this.create = true;
  this.filesystem = null;
  this.fileEntry = null;
  this.seek = 0;
};

File.prototype._isWebKit = function _isWebKit() {
  return !!window.webkitRequestFileSystem;
};

export default File;
