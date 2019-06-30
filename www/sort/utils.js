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

// export * from 'https://cdn.jsdelivr.net/npm/knockout@3.5.0'

// reexport preact lib
export {
    Component,
    h,
    render
} from 'https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs';

export {
    createRandomArray,
    swapArrayElements,
    elapsed,
    getElementbyName,
}
