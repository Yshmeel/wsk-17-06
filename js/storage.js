const STORAGE_KEY = '@presentation';

/**
 * @returns {any|*[]}
 */
const get = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

/**
 * @param {Object} value
 */
const set = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

window._storage = {
    get,
    set,
};
