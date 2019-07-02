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

/**
 * Fill passes array with random uints
 * @param {Uint32Array} uint32Array
 * @param {number} max
 */
function fillArrayWithRandoms(uint32Array, max) {
    const len = uint32Array.length;
    for (let ind = len; ind > -1; ind--) {
        uint32Array[ind] = getArbitaryRandomInt(max);
    }
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

/**
 * Run any function as self executed function in new Worker
 * @param fn
 * @returns {Worker}
 */
function runInWorker(fn) {
    return new Worker(URL.createObjectURL(new Blob([
            '(' + fn + ')()'
        ]))
    );
}

class TaskRunner {
    constructor({worker = null, workerUrl = null}) {
        if (!worker && !workerUrl) {
            throw new Error('Cannot create runner. Required worker or worker url.');
        }

        this._listeners = new Map([
            ['message', this._onMessage.bind(this)],
            ['error', this._onError.bind(this)]
        ]);
        this._taskPromises = new Map();
        this.worker = worker || new Worker(workerUrl);
        this._taskIdIerator = (function* idGenerator() {
            let id = 0;
            while (true) {
                yield ++id;
            }
        })();

        this._bindEvents();
    }

    _bindEvents() {
        for (const [eventType, listener] of this._listeners) {
            this.worker.addEventListener(eventType, listener);
        }
    }

    _unbindEvents() {
        for (const [eventType, listener] of this._listeners) {
            this.worker.removeEventListener(eventType, listener);
        }
    }

    _onMessage(messageEvent) {
        const {_runnerTaskId, ...resolveData} = messageEvent.data;

        if (!this._taskPromises.has(_runnerTaskId)) {
            return;
        }

        // fetch promise resolver corrsponding to task id
        const {resolve} = this._taskPromises.get(_runnerTaskId);
        // resolve promise
        resolve(resolveData);
        // {resolve, reject} didn't needed anymore
        this._taskPromises.delete(_runnerTaskId);
    }

    _onError(errorEvent) {
        const {_runnerTaskId, ...rejectData} = errorEvent;

        if (!this._taskPromises.has(_runnerTaskId)) {
            throw errorEvent;
        }

        // fetch promise rejector corrsponding to task id
        const {reject} = this._taskPromises.get(_runnerTaskId);
        // reject promise
        reject(rejectData);
        // {resolve, reject} didn't needed anymore
        this._taskPromises.delete(_runnerTaskId);
    }

    /**
     * taskDescriptor, transfer - same parameters as in postMessage method
     * @param taskDescriptor
     * @param transfer
     * @returns {Promise<any>}
     */
    promiseTaskDone(taskDescriptor, transfer) {
        if (!taskDescriptor) {
            throw new Error('Cannot run task. Required taskDescriptor.');
        }
        if (transfer && !Array.isArray(transfer)) {
            throw new Error('Cannot run task. Tranfer have to be array of buffers to transfer');
        }

        // Worker have to send _runnerTaskId in message when task done
        // make copy to not garbage in caller object
        const messageData = Object.assign(
            {},
            taskDescriptor,
            {_runnerTaskId: this._taskIdIerator.next().value});
        const promise = new Promise((resolve, reject) => {
            this._taskPromises.set(messageData._runnerTaskId, {resolve, reject});
        });
        this.worker.postMessage(messageData, transfer);
        return promise;
    }

    dispose() {
        this._unbindEvents();
    }
}

const classNames = window.classNames;

// reexport preact lib
export {
    Component,
    h,
    render
} from 'https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs';

export {
    classNames,
    createRandomArray,
    swapArrayElements,
    elapsed,
    getElementbyName,
    fillArrayWithRandoms,
    runInWorker,
    TaskRunner,
}
