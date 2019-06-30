import {createRandomArray, swapArrayElements, elapsed, getElementbyName, Component, h, render} from "./utils.js";

const availableLenghts = [
    10, 100, 1000, 10000
];

class BubbleSectionComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            calculating: false,
            calcResults: [
                // {
                //     arrayType: 'RANDOM' | 'SORTED' | 'NEAR_SORTED',
                //     arrayLength: 0,
                //     duration: Date.now(),
                // }
            ]
        };
    }

    bubbleForm = null;

    setFormRef(el) {
        this.bubbleForm = el;
    }

    onSubmitBubbleForm(ev) {

    }

    resultIdIerator = (function* idGenerator(){
        let id = 0;
        while (true) {
            yield ++id;
        }
    })();

    performTestCalcWithArray({probeArray, probeType}) {
        const id = this.resultIdIerator.next();
        const newResult = {
            arrayType: probeType,
            arrayLength: probeArray.length,
            duration: null,
            id,
        };

        this.setState(state => {
            const calcResults = state.calcResults.slice();
            calcResults.push(newResult);
            return {
                calcResults,
            };
        });

        // TODO add setTimeout to allow update view

        const duration = elapsed(() => {
            bubbleSort(probeArray);
        });

        this.setState()
    }

    performTestCalcWithOneLength({len}) {
        const probeArray = createRandomArray(len, Math.floor((len * 2) / 3));
        this.setState({
            calculating: true
        });

        // random array:
        const firstResult = {
            arrayType: 'RANDOM',
            arrayLength: len,
            duration: null,
        };
        this.setState({
            calcResults: calcResults.slice().push(firstResult)
        });
        let duration = elapsed(() => {
            bubbleSort(probeArray);
        });
        this.setState({
            calcResults: calcResults.slice(0, -1).push(firstResult)
        })
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

    render(props, state) {
        return (
            h('div', {'class': 'p-strip is-shallow is-bordered'},
                h(Header),
                h(Description),
                h('div', {'class': 'row'},
                    h('div', {'class': 'col-12'},
                        h('form', {
                                'class': 'p-form p-form--inline',
                                ref: this.setFormRef,
                                onSubmit: this.onSubmitBubbleForm.bind(this)
                            },
                            h('div', {'class': 'p-form__group p-form-validation'},
                                h('div', {'class': 'p-form__control u-clearfix'},
                                    h('div', {'class': 'p-form-validation__select-wrapper'},
                                        h('select', {
                                                'class': 'p-form-validation__input',
                                                name: 'bubbleArrayLength',
                                                id: 'bubbleArrayLengthSelect'
                                            },
                                            availableLenghts.map(len => h('option', {value: len}, len)))
                                    ),
                                    h('p', {'class': 'p-form-help-text'}, 'Select array length'),
                                )
                            ),
                            h('button', {
                                    'class': 'p-button--neutral has-icon',
                                    'type': 'submit',
                                },
                                h('i', {'class': 'p-icon--spinner', name: 'waitIndicatorIcon'}),
                                'Run bubble sort'
                            )
                        )
                    )
                ),
                h('div', {'class': 'row'},
                    h('div', {'class': 'col-12'},
                        h('h4', null, 'Results')
                    )
                ),
                h('div', {'class': 'row'},
                    h('div', {'class': 'col-12'},
                        h('table', null,
                            h('colgroup', null,
                                h('col', null),
                                h('col', null),
                                h('col', null),
                            ),
                            h('thead', null,
                                h('tr', null,
                                    h('th', null, 'Source array'),
                                    h('th', null, 'Number of elements'),
                                    h('th', null, 'Time')
                                )
                            ),
                            h('tbody', null),
                            h('tfoot', null),
                        ),
                    )
                )
            )
        );
    }
}

function Header(props) {
    return (
        h('div', {'class': 'row',},
            h('h2', {'class': 'col-12',},
                'Bubble',
            )
        )
    );
}

function Description() {
    return (
        h('div', {'class': 'row'},
            h('div', {'class': 'col-12'},
                h('p', null,
                    h('a', {href: 'https://en.wikipedia.org/wiki/Bubble_sort'}, 'Bubble sort'),
                    'is not the worst but, yes, worse than many others.'
                )
            )
        )
    );
}


render(h(BubbleSectionComponent), document.querySelector('#bubbleSection'));


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
