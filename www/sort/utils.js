const maxInt = 0xFFFFFFFF;

/**
 * creates array of random uint32 integers
 * @param {number} len
 * @param {number} max
 * @returns {Uint32Array}
 */
function createRandomArray(len, max) {
    const result = new Uint32Array(len);
    for (let ind = result.length; ind > -1; ind--) {
        result[ind] = getArbitaryRandomInt(max);
    }
    return result;
}

/**
 * Fill passes array with random uints
 * @param {Uint32Array} uint32Array
 * @param {number} max
 */
function fillArrayWithRandoms(uint32Array, max) {
    const len = uint32Array.length;
    for (let ind = len; ind > -1; ind--) {
        uint32Array[ind] = getArbitaryRandomInt(max);
    }
}

function swapArrayElements(a, ind1, ind2) {
    const t = a[ind1];
    a[ind1] = a[ind2];
    a[ind2] = t;
}

function getArbitaryRandomInt(max = maxInt) {
    return Math.floor(Math.random() * max);
}

function elapsed(fn) {
    const start = Date.now();
    fn();
    const end = Date.now();
    return new Date(end - start);
}

function getElementbyName({sectionId, elementName}) {
    return document.querySelector(`#${sectionId} [name="${elementName}"]`);
}

const classNames = window.classNames;

// reexport preact lib
export {
    Component,
    h,
    render
} from 'https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs';

export {
    classNames,
    createRandomArray,
    swapArrayElements,
    elapsed,
    getElementbyName,
    fillArrayWithRandoms,
}
