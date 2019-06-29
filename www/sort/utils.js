const maxInt = 0xFFFFFFFF;

/**
 * creates array of random uint32 integers
 * @param {integer} len
 * @param {integer} max
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

export {
    createRandomArray,
    swapArrayElements,
    elapsed,
    getElementbyName,
}
