import {
    Component,
    h,
    classNames,
    fillArrayWithRandoms
} from "./utils.js";

const availableLenghts = [
    10, 100, 1000, 10000, 100000
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
                //     id: number
                // }
            ]
        };

        this.bubbleForm = null;

        this.resultIdIerator = (function* idGenerator() {
            let id = 0;
            while (true) {
                yield ++id;
            }
        })();
    }

    componentDidMount() {
        this.sortWorker = runWorker();
        this.bindedWorkerMessageListener = this.onMessageFromWorker.bind(this);
        this.sortWorker.addEventListener('message', this.bindedWorkerMessageListener);
    }

    componentWillUnmount() {
        this.sortWorker.removeEventListener('message', this.bindedWorkerMessageListener);
        this.sortWorker.terminate();
    }

    setFormRef(el) {
        this.bubbleForm = el;
    }

    onSubmitBubbleForm(ev) {
        ev.preventDefault();
        if (this.state.calculating) {
            return;
        }
        const len = parseInt(ev.target.elements['bubbleArrayLength'].value, 10);
        this.performTestCalcWithOneLength({len});
    }

    onMessageFromWorker(messageEvenet) {
        const {id, duration, passBuffer} = messageEvenet.data;
        const resultData = this.state.calcResults.find(r => r.id === id);
        // update result object
        // change id else preact will not detect changes
        const newResultData = Object.assign({}, resultData, {id: this.resultIdIerator.next().value, duration});

        this.setState(state => {
            const resultDataInd = state.calcResults.findIndex(r => r.id === id);
            const results = state.calcResults.slice();
            results.splice(resultDataInd, 1, newResultData);
            return {
                calcResults: results
            };
        });

        switch (resultData.arrayType) {
            case 'RANDOM':
                // run task with sorted array:
                this.performTestCalcWithArray({probeBuffer: passBuffer, probeType: 'SORTED'});
                break;
            case 'SORTED':
                // run task with near-sorted array:
                // set one array element to sorted array becomes "near-sorted"
                const probeArray = new Uint32Array(passBuffer);
                probeArray[probeArray.length - 7] = probeArray[probeArray.length - 7] === 0 ? 1 : 0;
                this.performTestCalcWithArray({probeBuffer: passBuffer, probeType: 'NEAR_SORTED'});
                break;
            case 'NEAR_SORTED':
                // case 'NEAR_SORTED' is last so do nothing
                // stop, we should update state:
                this.setState({
                    calculating: false,
                });
                break;
        }

    }

    performTestCalcWithArray({probeBuffer, probeType}) {
        const id = this.resultIdIerator.next().value;

        const newResult = {
            arrayType: probeType,
            arrayLength: probeBuffer.byteLength / 4,
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

        // init calculation
        this.sortWorker.postMessage({
            id,
            passBuffer: probeBuffer,
        }, [
            probeBuffer
        ]);
    }

    performTestCalcWithOneLength({len}) {
        // each uint32 = 4 bytes
        const buffer = new ArrayBuffer(len * 4);
        const probeArray = new Uint32Array(buffer);
        fillArrayWithRandoms(probeArray, Math.floor((len * 2) / 3));
        this.performTestCalcWithArray({probeBuffer: buffer, probeType: 'RANDOM'});

        this.setState({
            calculating: true,
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
                                ref: this.setFormRef.bind(this),
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
                                    'disabled': state.calculating,
                                },
                                h('i', {
                                    'class': classNames({
                                        'p-icon--spinner': true,
                                        'u-animation--spin': state.calculating
                                    })
                                }),
                                ' Run bubble sort'
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
                            h('tbody', null, state.calcResults.map(res => {
                                return h('tr', {key: res.id},
                                    h('td', null, res.arrayType),
                                    h('td', null, res.arrayLength),
                                    h('td', null,
                                        typeof res.duration === 'number' ?
                                            `${res.duration} ms` :
                                            h('i', {'class': 'p-icon--spinner u-animation--spin'})
                                    )
                                )
                            })),
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
                    ' is not the worst but, yes, worse than many others.'
                )
            )
        )
    );
}

/**
 * Creates worker for bubbleSortInWorker()
 * @returns {Worker}
 */
function runWorker() {
    return new Worker(URL.createObjectURL(new Blob([
            '(' + bubbleSortInWorker + ')()'
        ]))
    );
}

/**
 * Function to run in web worker
 */
function bubbleSortInWorker() {
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

    function swapArrayElements(a, ind1, ind2) {
        const t = a[ind1];
        a[ind1] = a[ind2];
        a[ind2] = t;
    }

    self.addEventListener('message', function (messageEvent) {
        const {id, passBuffer} = messageEvent.data;
        const passedArray = new Uint32Array(passBuffer);

        const start = Date.now();
        bubbleSort(passedArray);
        const end = Date.now();

        postMessage({
            id,
            duration: end - start,
            passBuffer,
        }, [
            passBuffer
        ]);
    });
}

export {
    BubbleSectionComponent,
}
