/*
    Storage (local; client-side [window])
    https://developer.mozilla.org/en-US/docs/Web/API/Storage
*/

/*  STORAGE MOCKUP FOR TESTING (jsdom)  */

if (typeof(window.localStorage) === 'undefined' || window.localStorage === null) {

    // For Testing: Apparently you can disregard the TypeScript errors.

    interface LocalStorageState {
        [key: string]: string;
    }

    var localStorage = (function () {
        let store: LocalStorageState;
        return {
            getItem: function (key: string) {
                return store[key];
            },
            setItem: function (key: string, value: string) {
                store[key] = value.toString();
            },
            clear: function () {
                store = {};
            },
            removeItem: function (key: string) {
                delete store[key];
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorage });
}

/*  STORAGE FUNCTIONS  */

export const setStorageItem = (storage: Storage, key: string, value: string) => {
    try {
        storage.setItem(key, value);
    } catch (e) {
        // console.error(e)
    }
};

export const getStorageItem = (storage: Storage, key: string) => {
    try {
        return storage.getItem(key);
    } catch (e) {
        // console.error(e)
        return null;
    }
};

export const clearStorageItem = (storage: Storage, key: string) => {
    try {
        return storage.removeItem(key);
    } catch (e) {
        // console.error(e)
        return null;
    }
};
