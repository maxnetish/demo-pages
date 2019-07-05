function appendOutput(str, logElement) {
    logElement = logElement || '#page-output';
    const outputElm = typeof logElement === 'string' ? document.querySelector(logElement) : logElement;
    outputElm.textContent = `${outputElm.textContent}\n${str}`;
}

export class ExampleEs6Class {
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

export const someMap = new Map([
    [{key: 'one'}, {value: 'value of one'}],
    [{key: 'two'}, {value: 'value of two'}],
]);

export {Component} from 'https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs';

export {
    appendOutput
};
