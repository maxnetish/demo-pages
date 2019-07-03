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
    // 2,
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

/**
 * Insert part of Shell sort
 * @param {Uint32Array} a
 * @param {number} increment
 */
function insertSort(a, increment) {
    const aLen = a.length;
    const aLenWithoutOne = aLen - 1;
    for (let startInd = 0; startInd < increment; startInd++) {
        for (let ind = startInd; ind < aLenWithoutOne; ind += increment) {
            let passInd = ind + increment;
            if (passInd > aLenWithoutOne) {
                passInd = aLenWithoutOne;
            }
            // console.log(`ind: ${ind}, increment: ${increment}, a: ${a}`);
            for (; passInd - increment > -1; passInd -= increment) {
                let prevPassInd = passInd - increment;
                if (a[prevPassInd] > a[passInd]) {
                    swapArrayElements(a, prevPassInd, passInd);
                }
            }
        }
    }
}

/**
 * Shell sort implementation
 * @param {Uint32Array} a
 */
function shellSort(a) {
    const aLen = a.length;
    if (aLen < 2) {
        // array with len 0 or 1 already sorted
        return;
    }
    const distances = getDistances(aLen);
    for (let distanceIndex = distances.length - 1; distanceIndex > -1; distanceIndex--) {
        insertSort(a, distances[distanceIndex]);
    }
}

/**
 * left and right - instanses of sorted ArraySlice, merges into result ArraySlice
 * @param {ArraySlice} left
 * @param {ArraySlice} right
 * @param {ArraySlice} result
 */
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
    const {algo, passBuffer, ...otherData} = messageEvent.data;
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
]);

self.addEventListener('message', onMessage);
