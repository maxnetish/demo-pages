/**
 * Bubble sort
 */

/**
 *
 * @param {Uint32Array} a
 */
function bubbleSort(a) {
    const aLen = a.length;

    if (aLen === 0 || aLen === 1) {
        return;
    }

    let prev,
        ind,
        passed = false;
    while (!passed) {
        passed = true;
        for (ind = 1; ind < aLen; ind++) {
            prev = ind - 1;
            if (a[prev] > a[ind]) {
                passed = false;
                swapArrayElements(a, prev, ind);
            }
        }
    }
}

/**
 * Quick sort
 */

function doQuicksort(a) {
    quicksort(a, 0, a.length - 1);
}

function quicksort(a, low, high) {
    if (low < high) {
        // partitioning:
        const pivotIndex = partitionQuickSort(a, low, high);
        // now on left of pivotIndex elemnts lesser than a[pivotIndex], on right - elements greater than a[pivotIndex]
        // repeat partitioning for left and right half
        quicksort(a, low, pivotIndex - 1);
        quicksort(a, pivotIndex, high);
    }
}

function partitionQuickSort(a, low, high) {
    // select pivot element: in the middle of segment
    const middleInd = Math.floor((low + high) / 2);
    const pivot = a[middleInd];
    let lowCursor = low;
    let highCursor = high;

    // went to pivot, on left of pivot we have lesser elemnts, on right we have greater elements thann pivot
    while (true) {
        while (lowCursor <= high && a[lowCursor] < pivot) {
            lowCursor++;
        }
        while (highCursor >= low && a[highCursor] > pivot) {
            highCursor--;
        }
        if (lowCursor >= highCursor) {
            break;
        }
        // found elements that sits in wrong half - swaps they
        swapArrayElements(a, lowCursor, highCursor);
        lowCursor++;
        highCursor--;
    }

    const pivotIndex = highCursor + 1;
    return pivotIndex;
}

/**
 * Merge sort
 */

/**
 *
 * @param {Uint32Array} a
 */
function mergesortIterative(a) {
    const aLen = a.length;
    let shouldSwap = false;
    // slice for buffering intermediate results
    // use O(n) of mem
    let intermediate = new Uint32Array(a.length);
    let mergedTo = 0;
    for (let segmentLen = 1; segmentLen < aLen; segmentLen *= 2) {
        // break a into sublists
        // segmentLen is max len of current sublist
        for (let left = 0; left < aLen - segmentLen; left += 2 * segmentLen) {
            // each time we take two slices: [left:mid] and [mid:right] and merge them into
            // intermediate slice
            const mid = left + segmentLen;
            let right = left + 2 * segmentLen;
            if (right > aLen) {
                // to correct merge remaining tail
                right = aLen;
            }
            merge(new ArraySlice(a, left, mid), new ArraySlice(a, mid, right), new ArraySlice(intermediate, left, right));
            mergedTo = right
        }
        // copy tail to intermediate else tail will be incorrect
        ArraySlice.copy(new ArraySlice(intermediate, mergedTo), new ArraySlice(a, mergedTo));
        // We use two arrays in turns to not to allocate array in every pass
        // shouldSwap sets if we need copy from a to intermediate else caller will get ref on not actual slice
        shouldSwap = !shouldSwap;
        // swap arrays
        const t = a;
        a = intermediate;
        intermediate = t;
    }
    if (shouldSwap) {
        ArraySlice.copy(new ArraySlice(intermediate), new ArraySlice(a));
    }
}

function merge(left, right, result) {
    let cursorLeft = 0;
    let cursorRight = 0;
    let cursorResult = 0;
    const lenLeft = left.length;
    const lenRight = right.length;

    while (cursorLeft < lenLeft || cursorRight < lenRight) {
        if (cursorLeft >= lenLeft) {
            // items only in right part
            result.set(cursorResult, right.get(cursorRight));
            cursorResult++;
            cursorRight++;
            continue;
        }
        if (cursorRight >= lenRight) {
            // items remain only in left part
            result.set(cursorResult, left.get(cursorLeft));
            cursorResult++;
            cursorLeft++;
            continue;
        }
        // select lesser item and insert into result
        if (left.get(cursorLeft) <= right.get(cursorRight)) {
            result.set(cursorResult, left.get(cursorLeft));
            cursorResult++;
            cursorLeft++;
        } else {
            result.set(cursorResult, right.get(cursorRight));
            cursorResult++;
            cursorRight++;
        }
    }
}

/**
 * Platform sort implementation
 */

function jsSort(a) {
    a.sort();
}

/**
 * Shell sort
 */

// magic numbers
// sequence https://oeis.org/A055875
// Ivan Panchenko
//
const distancesByPanchenko = [
    1,
    // 2 make match slow
    2,
    19,
    103,
    311,
    691,
    1321,
    2309,
    3671,
    5519,
    7919,
    10957,
    14753,
    19403,
    24809,
    31319,
    38873,
    47657,
    57559,
    69031,
    81799,
    96137,
    112291,
    130073,
    149717,
    171529,
    195043,
    220861,
    248851,
    279431,
    312583,
    347707,
    386093,
    427169,
    470933,
    517553,
    567871,
    620531,
    677539,
    737203,
    800573,
    867677,
    938533,
    1013609,
    1092733,
    1175071,
    1262221,
    1353887,
    1449523,
    1549817,
    1655131,
    1765469,
    1879463,
    1999121,
    2124041,
    2254493,
    2389943,
    2530973,
    2677583,
    2829503,
    2987843,
    3152099,
    3321529,
    3498577,
    3681131,
    3870077,
    4065583,
    4268039,
    4476917,
    4693093,
    4915571,
    5145347,
    5382613,
    5628457,
    5881649,
    6140957,
    6408929,
    6684971,
    6966829,
    7258871,
    7559173,
    7867547,
    8184727,
    8510507,
    8843647,
    9187333,
    9539749,
    9900923,
];

/**
 *  get magick distances for Shell sort
 * @param {number} aLength
 * @returns {[number]}
 */
function getDistances(aLength) {
    if (aLength < 2) {
        return new ArraySlice();
    }

    let ind = distancesByPanchenko.length - 1;
    // ind > 0 because we will return empty slice for such case, see higher
    for (; ind > 0 && distancesByPanchenko[ind] >= aLength; ind--) {
    }

    return distancesByPanchenko.slice(0, ind + 1);
}

function shellSort(a) {
    let internInd, ind, iItem;
    const aLen = a.length;
    if (aLen < 2) {
        // array with len 0 or 1 already sorted
        return;
    }
    const distances = getDistances(aLen);
    for (let distanceIndex = distances.length - 1; distanceIndex > -1; distanceIndex--) {
        let distance = distances[distanceIndex];

        for (ind = distance; ind < aLen; ind++) {
            // get element at ind
            iItem = a[ind];
            // and choose, where we have to insert it
            for (internInd = ind - distance; internInd > -1 && a[internInd] > iItem; internInd -= distance) {
                a[internInd + distance] = a[internInd];
            }
            a[internInd + distance] = iItem;
        }
    }
}

/**
 * Heap sort
 */

/**
 *
 * @param {Uint32Array} a
 */
function heapSort(a) {
    const aLen = a.length;
    // Build heap
    for (let ind = Math.floor(aLen / 2 - 1); ind > -1; ind--) {
        downHeap(a, ind, aLen - 1);
    }
    // Now a[] is heap

    for (let ind = aLen - 1; ind > 0; ind--) {
        // First element is max element in current heap
        // move it outside of heap
        swapArrayElements(a, ind, 0);
        // and restore heap in slice [(0)...(ind-1)]
        downHeap(a, 0, ind - 1);
    }
}

/**
 *
 * @param {Uint32Array} a
 * @param {number} low
 * @param {number} high
 */
function downHeap(a, low, high) {
    const headItem = a[low];
    const maxIndexWithChild = Math.floor(high / 2);

    while (low <= maxIndexWithChild) {
        // while a[low] has child
        let childIndex = 2 * low;
        // choose greater child: 'left' or 'right'
        if (childIndex < high && a[childIndex] < a[childIndex + 1]) {
            // 'right' greater than 'left', so choose 'right' child, else choose 'left' child
            childIndex++;
        }
        if (headItem >= a[childIndex]) {
            // if item at head greater than greater child,
            // do nothing: headItem already in right place
            break;
        }
        // else greater child move up
        a[low] = a[childIndex];
        // and go to check headItem in its new position - at childIndex (really in a[low] will be greater child)
        low = childIndex;
    }
    // here really place headItem in found position
    a[low] = headItem;
}

class ArraySlice {
    constructor(array = [], left = 0, right = array.length) {
        if (left < 0 || left > right) {
            throw new Error('Index out of range. left have to be between 0 and right');
        }

        if (right > array.length) {
            throw new Error('Index out of range. right have to be lesser or equal than rray.length');
        }

        this._internalArray = array;
        this._internalLeft = left;
        this._internalRight = right;
    }

    * [Symbol.iterator]() {
        let ind = this._internalLeft;
        while (ind < this._internalRight) {
            yield this._internalArray[ind];
            ind++;
        }
    }

    get length() {
        return this._internalRight - this._internalLeft;
    }

    get(index) {
        if (index < 0 || index >= this._internalRight - this._internalLeft) {
            return;
        }
        return this._internalArray[this._internalLeft + index];
    }

    set(index, value) {
        if (index < 0 || index >= this._internalRight - this._internalLeft) {
            throw new Error('Index out of range');
        }
        this._internalArray[this._internalLeft + index] = value;
    }

    /**
     *
     * @param {ArraySlice} target
     * @param {ArraySlice} source
     */
    static copy(target, source) {
        for (let ind = 0; ind < target.length && ind < source.length; ind++) {
            target.set(ind, source.get(ind));
        }
    }
}

function swapArrayElements(a, ind1, ind2) {
    const t = a[ind1];
    a[ind1] = a[ind2];
    a[ind2] = t;
}

function onMessage(messageEvent) {
    // Not work in Edge
    // const {algo, passBuffer, ...otherData} = messageEvent.data;
    const {algo, passBuffer} = messageEvent.data;
    const otherData = Object.assign({}, messageEvent.data);
    if (otherData.hasOwnProperty('algo')) {
        delete otherData.algo;
    }
    if (otherData.hasOwnProperty('passBuffer')) {
        delete otherData.passBuffer;
    }

    const passedArray = new Uint32Array(passBuffer);

    const sortFn = sortAlgoMap.get(algo);

    const start = Date.now();
    sortFn(passedArray);
    const end = Date.now();

    const answerMessageData = Object.assign(otherData, {
        algo,
        passBuffer,
        duration: end - start
    });
    postMessage(answerMessageData, [passBuffer]);
}

const sortAlgoMap = new Map([
    ['BUBBLE', bubbleSort],
    ['QUICK', doQuicksort],
    ['MERGE', mergesortIterative],
    ['PLATFORM', jsSort],
    ['SHELL', shellSort],
    ['HEAP', heapSort],
]);

self.addEventListener('message', onMessage);
