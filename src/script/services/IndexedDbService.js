document.addEventListener('DOMContentLoaded', async () => {
  class IndexedDbService {
    name = null;
    idb = null;

    constructor(name, version, config) {
      this.name = name;
      this.idb = window.idb.openDB(name, version, config);

      this.setup();
    }

    async get(key) {
      return (await this.idb).get(this.name, key);
    }
    async set(key, val) {
      return (await this.idb).put(this.name, val, key);
    }
    async del(key) {
      return (await this.idb).delete(this.name, key);
    }
    async clear() {
      return (await this.idb).clear(this.name);
    }
    async keys() {
      return (await this.idb).getAllKeys(this.name);
    }

    setup() {
      window[`idb-${this.name}`] = this;
    }
  }

  window.IndexedDbService = IndexedDbService;
});
