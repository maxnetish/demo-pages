import {createRandomArray, swapArrayElements, elapsed, getElementbyName} from "./utils.js";

const sectionId = 'bubbleSection';
const formName = 'bubbleForm';

const state = {
    calculating: false,
    calcResults: [
        // {
        //     arrayType: 'RANDOM' | 'SORTED' | 'NEAR_SORTED',
        //     arrayLength: 0,
        //     duration: Date.now(),
        // }
    ]
};

function updateState(update) {
    Object.assign(state, update);
    updateView();
}

function updateView() {
    const bubbleRunSortButton = getElementbyName({
        sectionId,
        elementName: 'bubbleRunSortButton',
    });
    const waitIndicatorIcon = getElementbyName({
        sectionId,
        elementName: 'waitIndicatorIcon'
    });
    const resultList = getElementbyName({
        sectionId,
        elementName: 'calcResults',
    });
    const resultItemTemplate = getElementbyName({
        sectionId,
        elementName: 'calcResultItemTemplate',
    });

    if (bubbleRunSortButton) {
        bubbleRunSortButton.disabled = state.calculating;
    }

    if (waitIndicatorIcon) {
        if (state.calculating) {
            waitIndicatorIcon.classList.add('u-animation--spin');
        } else {
            waitIndicatorIcon.classList.remove('u-animation--spin');
        }
    }

    if (resultList && resultItemTemplate) {
        const listItems = state.calcResults.map(oneResult => {
            const resultItem = resultItemTemplate.content.cloneNode(true);
            resultItem.querySelector('[data-src="arrayType"]').textContent = oneResult.arrayType;
            resultItem.querySelector('[data-src="arrayLength"]').textContent = oneResult.arrayLength;
            resultItem.querySelector('[data-src="duration"]').textContent = `${oneResult.duration.valueOf()} ms`;
            return resultItem;
        });
        // remove items
        const childNodes = Array.prototype.slice.call(resultList.childNodes);
        childNodes.forEach(child => {
            if (child !== resultItemTemplate) {
                child.remove();
            }
        });

        // while (resultList.firstChild) {
        //     resultList.removeChild(resultList.firstChild);
        // }

        // add new ones
        listItems.forEach(listItem => {
            resultList.appendChild(listItem);
        });
    }
}


function onBubbleFormSubmit(ev) {
    ev.preventDefault();

    if (state.calculating) {
        return;
    }

    const targetForm = ev.target;
    const bubbleArrayLengthElement = targetForm.elements.bubbleArrayLength;

    const len = parseInt(bubbleArrayLengthElement.value, 10);
    runSort(len);
}

function runSort(len) {
    const probeArray = createRandomArray(len, Math.floor((len * 2) / 3));
    updateState({
        calculating: true
    });
    const calcResultsCopy = state.calcResults.slice();

    // random array:
    const firstResult = {
        arrayType: 'RANDOM',
        arrayLength: len,
        duration: null,
    };
    firstResult.duration = elapsed(() => {
        bubbleSort(probeArray);
    });
    calcResultsCopy.push(firstResult);

    // sorted array:
    const secondResult = {
        arrayType: 'SORTED',
        arrayLength: len,
        duration: null,
    };
    secondResult.duration = elapsed(() => {
        bubbleSort(probeArray);
    });
    calcResultsCopy.push(secondResult);

    // near sorted:
    // change one element in sorted array
    probeArray[probeArray.length - 7] = probeArray[probeArray.length - 7] === 0 ? 1 : 0;
    const thirdResult = {
        arrayType: 'NEAR_SORTED',
        arrayLength: len,
        duration: null,
    };
    thirdResult.duration = elapsed(() => {
        bubbleSort(probeArray);
    });
    calcResultsCopy.push(thirdResult);

    updateState({
        calculating: false,
        calcResults: calcResultsCopy,
    });
}

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

function initView() {
    document.bubbleForm.addEventListener('submit', onBubbleFormSubmit);
    updateView();
}


export {
    initView as init,
    bubbleSort,
}