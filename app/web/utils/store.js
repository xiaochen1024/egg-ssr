import {
  isObservable,
  toJS,
  isComputedProp,
  isObservableArray,
  isObservableMap,
} from 'mobx';

function isObject(value) {
  const type = typeof value;
  return value !== null
    && value !== undefined
    && (type === 'object' || type === 'function');
}

function union(...arrays) {
  const uniq = [];
  for (let i = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    for (let j = 0; j < arr.length; j++) {
      const elem = arr[j];
      if (uniq.indexOf(elem) === -1) {
        uniq.push(elem);
      }
    }
  }

  return uniq;
}

export function persistStores(stores) {
  const state = Object.keys(stores).reduce((s, key) => {
    const store = stores[key];
    if (isObservable(store)) {
      s[key] = toJS(store);
    } else {
      s[key] = store;
    }

    return s;
  }, {});

  return state;
}

export function hydrateStores(stores, initialState) {
  const keys = union(Object.keys(stores), Object.keys(initialState));
  keys.forEach((key) => {
    const store = stores[key];
    const state = initialState[key];

    if (state === undefined || state === null) {
      return;
    }

    if (isComputedProp(store, key)) {
      return;
    }

    if (isObservableMap(store)) {
      const it = store.keys();
      for (let k = it.next(); !k.done; k = it.next()) {
        const s = state[k.value];
        if (s) {
          store.set(k.value, s);
        }
      }
      return;
    }

    if (isObject(store) && !isObservableArray(store)) {
      hydrateStores(store, state);
      return;
    }

    stores[key] = state;
  });
}

export function createStores(storesClass, ctx) {
  const stores = Object.keys(storesClass).reduce((ss, key) => {
    const Clazz = storesClass[key];
    if (Clazz) {
      ss[key] = new Clazz(ctx);
    }
    return ss;
  }, {});

  return stores;
}
