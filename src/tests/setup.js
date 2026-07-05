import '@testing-library/jest-dom';

// Node 22+ の実験的 localStorage グローバル(--localstorage-file 未指定だと undefined)が
// jsdom の localStorage を隠してしまうため、インメモリ実装を注入する。
// テストが vi.spyOn(Storage.prototype, ...) でモックできるよう Storage も差し替える。
class MemoryStorage {
  constructor() {
    this._data = new Map();
  }
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }
  setItem(key, value) {
    this._data.set(String(key), String(value));
  }
  removeItem(key) {
    this._data.delete(key);
  }
  clear() {
    this._data.clear();
  }
  key(i) {
    return [...this._data.keys()][i] ?? null;
  }
  get length() {
    return this._data.size;
  }
}

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'Storage', {
    value: MemoryStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}
