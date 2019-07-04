import {
    Component,
    h,
    classNames,
    fillArrayWithRandoms,
    TaskRunner,
} from "./utils.js";

const availableLenghts = [
    10, 100, 1000, 10000, 100000, 1000000, 10000000
];

const arrayTypeMap = new Map([
    ['RANDOM', 'Random'],
    ['SORTED', 'Sorted'],
    ['REVERSED', 'Reversed'],
    ['NEAR_SORTED', 'Almost sorted']
]);

const sortAlgorithmesMap = new Map([
    ['BUBBLE', 'Bubble'],
    ['QUICK', 'Quick'],
    ['MERGE', 'Merge'],
    ['SHELL', 'Shell sort'],
    ['PLATFORM', 'JS internal implementation'],
]);

const utilsWorkerUrl = './array-worker.js';
const sortWorkerUrl = './sort-worker.js';

class SortSectionComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            calculating: false,
            calcResults: [
                // {
                //     arrayType: 'RANDOM' | 'SORTED' | 'NEAR_SORTED' | 'REVERSED',
                //     arrayLength: 0,
                //     algo: 'BUBBLE',
                //     duration: Date.now(),
                //     id: number
                // }
            ]
        };

        this.sortParametersForm = null;

        this.resultIdIerator = (function* idGenerator() {
            let id = 0;
            while (true) {
                yield ++id;
            }
        })();

    }

    componentDidMount() {
        this.arrayUtilsTaskRunner = new TaskRunner({workerUrl: utilsWorkerUrl});
        this.sortTaskRunner = new TaskRunner({workerUrl: sortWorkerUrl});
    }

    componentWillUnmount() {
        this.arrayUtilsTaskRunner.terminate();
        this.sortTaskRunner.terminate();
    }

    setFormRef(el) {
        this.sortParametersForm = el;
    }

    onClearButtonClick(ev) {
        this.setState(state => {
            const calcResults = state.calcResults.filter(r => typeof r.duration !== 'number');
            return {
                calcResults,
            };
        });
    }

    onTerminateWorkerButtonClick(calcResult, ev) {
        this.arrayUtilsTaskRunner.terminate();
        this.sortTaskRunner.terminate();
        this.arrayUtilsTaskRunner = new TaskRunner({workerUrl: utilsWorkerUrl});
        this.sortTaskRunner = new TaskRunner({workerUrl: sortWorkerUrl});

        this.setState(state => {
            const calcResults = state.calcResults.slice();
            const calcResultInd = calcResults.findIndex(r => r.id === calcResult.id);
            calcResults.splice(calcResultInd, 1);
            return {
                calculating: false,
                calcResults,
            };
        });
    }

    onSubmitSortOptionsForm(ev) {
        ev.preventDefault();
        if (this.state.calculating) {
            return;
        }

        const len = parseInt(ev.target.elements['arrayLength'].value, 10);
        const arrayKind = ev.target.elements['arrayKind'].value;
        const sortAlgorithm = ev.target.elements['sortAlgorithm'].value;
        const max = Math.floor((len * 2) / 3);
        const id = this.resultIdIerator.next().value;

        // create buffer for calculations
        const passBuffer = new ArrayBuffer(len * 4);

        const newResult = {
            arrayType: arrayKind,
            arrayLength: len,
            algo: sortAlgorithm,
            duration: null,
            id,
        };

        // update view before calculating
        this.setState(state => {
            const results = state.calcResults.slice();
            results.push(newResult);
            return {
                calculating: true,
                calcResults: results,
            };
        });

        // appropiate filling:
        this.arrayUtilsTaskRunner.promiseTaskDone({
            util: arrayKind,
            max,
            passBuffer,
        }, [passBuffer])
            .then(({passBuffer}) => {
                // buffer filled
                // now wait sorting...
                return this.sortTaskRunner.promiseTaskDone({
                    id,
                    algo: sortAlgorithm,
                    passBuffer
                }, [passBuffer]);
            })
            .then(({id, duration, passBuffer}) => {
                const arr = new Uint32Array(passBuffer);
                console.log(arr.length);
                // sort done, show result
                this.setState(state => {
                    const results = state.calcResults.slice();
                    const newResultId = results.findIndex(r => r.id === id);
                    const updatedResult = Object.assign({}, results[newResultId], {
                        duration,
                        // id: this.resultIdIerator.next().value
                    });
                    results.splice(newResultId, 1, updatedResult);
                    return {
                        calculating: false,
                        calcResults: results,
                    };
                });
            })
            .then(null, err => {
                this.setState({
                    calculating: false
                });
                console.warn(err);
            });
    }

    render(props, state) {
        return (
            h('div', {'class': 'p-strip is-shallow is-bordered'},
                h(Description),
                h('div', {'class': 'row'},
                    h('div', {'class': 'col-12'},
                        h('form', {
                                'class': 'p-form p-form--inline',
                                ref: this.setFormRef.bind(this),
                                onSubmit: this.onSubmitSortOptionsForm.bind(this)
                            },
                            h('div', {'class': 'p-form__group p-form-validation'},
                                h('div', {'class': 'p-form__control u-clearfix'},
                                    h('div', {'class': 'p-form-validation__select-wrapper'},
                                        h('select', {
                                                'class': 'p-form-validation__input',
                                                name: 'arrayLength',
                                            },
                                            availableLenghts.map(len => h('option', {value: len}, len)))
                                    ),
                                    h('p', {'class': 'p-form-help-text'}, 'Select array length'),
                                ),
                            ),
                            h('div', {'class': 'p-form__group p-form-validation'},
                                h('div', {'class': 'p-form__control u-clearfix'},
                                    h('div', {'class': 'p-form-validation__select-wrapper'},
                                        h('select', {'class': 'p-form-validation__input', name: 'arrayKind'},
                                            Array.from(arrayTypeMap).map(([arrayType, arrayName]) => h('option', {value: arrayType}, arrayName)))
                                    ),
                                    h('p', {'class': 'p-form-help-text'}, 'Select array type'),
                                )
                            ),
                            h('div', {'class': 'p-form__group p-form-validation'},
                                h('div', {'class': 'p-form__control u-clearfix'},
                                    h('div', {'class': 'p-form-validation__select-wrapper'},
                                        h('select', {'class': 'p-form-validation__input', name: 'sortAlgorithm'},
                                            Array.from(sortAlgorithmesMap).map(([algoType, algoName]) => h('option', {value: algoType}, algoName)))
                                    ),
                                    h('p', {'class': 'p-form-help-text'}, 'Select sort algorithm'),
                                )
                            ),
                            h('button', {
                                    'class': 'p-button--neutral has-icon',
                                    'type': 'submit',
                                    'disabled': state.calculating,
                                },
                                h('i', {
                                    'class': classNames({
                                        ' p-icon--spinner': true,
                                        'u-animation--spin': state.calculating
                                    })
                                }),
                                ' Run sort'
                            ),
                            h('button', {
                                    'class': 'p-button--negative has-icon',
                                    'type': 'button',
                                    'disabled': state.calcResults.length === 0,
                                    onClick: this.onClearButtonClick.bind(this),
                                },
                                h('i', {
                                    'class': 'p-icon--close is-light'
                                }),
                                ' Clear results'
                            ),
                        ),
                    ),
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
                                h('col', null),
                            ),
                            h('thead', null,
                                h('tr', null,
                                    h('th', null, 'Source array'),
                                    h('th', null, 'Number of elements'),
                                    h('th', null, 'Sort algorithm'),
                                    h('th', null, 'Time, milliseconds'),
                                )
                            ),
                            h('tbody', null, state.calcResults.map(res => {
                                return (
                                    h('tr', {key: res.id},
                                        h('td', null, arrayTypeMap.get(res.arrayType) || res.arrayType),
                                        h('td', null, res.arrayLength.toLocaleString()),
                                        h('td', null, sortAlgorithmesMap.get(res.algo) || res.algo),
                                        h('td', null,
                                            typeof res.duration === 'number' ?
                                                res.duration.toLocaleString() :
                                                [
                                                    h('i', {'class': 'p-icon--spinner u-animation--spin'}),
                                                    h('button', {
                                                            'class': 'p-button p-button--base has-icon',
                                                            'type': 'button',
                                                            onClick: this.onTerminateWorkerButtonClick.bind(this, res),
                                                            title: 'Terminate calculation. Immediately terminate and restart background worker.'
                                                        },
                                                        h('i', {
                                                            'class': 'p-icon--error'
                                                        }),
                                                    ),
                                                ]
                                        )
                                    )
                                );
                            })),
                            h('tfoot', null),
                        ),
                    ),
                ),
            )
        )
    }
}

function Description() {
    return (
        h('div', {'class': 'row'},
            h('div', {'class': 'col-12'},
                h('p', null,
                    h('a', {href: 'https://en.wikipedia.org/wiki/Bubble_sort'}, 'Bubble sort'),
                    ' is not the worst but, yes, worse than many others.'
                ),
                h('p', null,
                    h('a', {href: 'https://en.wikipedia.org/wiki/Quicksort'}, 'Quick sort'),
                    ' is very quick, but recursive.'
                ),
                h('p', null,
                    h('a', {href: 'https://en.wikipedia.org/wiki/Merge_sort'}, 'Merge sort'),
                    ' a little bit slower than previous one, but it is not recursive.'
                ),
                h('p', null,
                    h('a', {href: 'https://en.wikipedia.org/wiki/Shellsort'}, 'Shell\'s sort'),
                    ' a little bit faster than bubble. Complexity: O(n',
                    h('sup', null, '2'),
                    ') - O(n log n). Implementation uses gaps from ',
                    h('a', {href: 'https://oeis.org/A055875'}, 'https://oeis.org/A055875'),
                ),
            )
        )
    );
}

export {
    SortSectionComponent,
}
