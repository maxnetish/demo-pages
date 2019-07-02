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

function swapArrayElements(a, ind1, ind2) {
    const t = a[ind1];
    a[ind1] = a[ind2];
    a[ind2] = t;
}

function onMessage(messageEvent) {
    const {id, algo, passBuffer, _runnerTaskId} = messageEvent.data;
    const passedArray = new Uint32Array(passBuffer);

    const sortFn = sortAlgoMap.get(algo);

    const start = Date.now();
    sortFn(passedArray);
    const end = Date.now();

    postMessage({
        id,
        algo,
        duration: end - start,
        passBuffer,
        _runnerTaskId,
    }, [
        passBuffer
    ]);
}

const sortAlgoMap = new Map([
    ['BUBBLE', bubbleSort],
    ['QUICK', doQuicksort]
]);

self.addEventListener('message', onMessage);
