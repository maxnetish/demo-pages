const maxInt = 0xFFFFFFFF;

/**
 * Fill passes array with random uints
 * @param {Uint32Array} uint32Array
 * @param {number} max
 */
function fillArrayRandoms(uint32Array, max = maxInt) {
    const len = uint32Array.length;
    for (let ind = len; ind > -1; ind--) {
        uint32Array[ind] = getArbitaryRandomInt(max);
    }
}

function fillArrayOrdered(uint32Array) {
    for (let ind = 0, len = uint32Array.length; ind < len; ind++) {
        uint32Array[ind] = ind;
    }
}

function fillArrayReverseOrdered(uint32Array) {
    for (let ind = 0, len = uint32Array.length; ind < len; ind++) {
        uint32Array[ind] = len - ind - 1;
    }
}

function fillArrayAlmostSorted(uint32Array, max = maxInt) {
    const medium = Math.floor(uint32Array.length / 2);
    fillArrayOrdered(uint32Array, max);
    // change one element
    uint32Array[medium] = uint32Array[medium] === 123456 ? 123457 : 123456;
}

function getArbitaryRandomInt(max = maxInt) {
    return Math.floor(Math.random() * max);
}

function onMessage(messageEvent) {

    // console.log('Array worker receive: ', messageEvent.data);

    const {util, max, passBuffer, _runnerTaskId} = messageEvent.data;
    const passedArray = new Uint32Array(passBuffer);
    const utilFn = utilsMap.get(util);

    if (utilFn) {
        utilFn(passedArray, max);
    }
    postMessage({
        util,
        max,
        passBuffer,
        _runnerTaskId,
    }, [
        passBuffer
    ]);
}

const utilsMap = new Map([
    ['RANDOM', fillArrayRandoms],
    ['SORTED', fillArrayOrdered],
    ['REVERSED', fillArrayReverseOrdered],
    ['NEAR_SORTED', fillArrayAlmostSorted]
]);

self.addEventListener('message', onMessage);
