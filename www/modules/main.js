import {appendOutput, Component, someMap, ExampleEs6Class} from "./utils.js";

const exampleInstance = new ExampleEs6Class([1, 2], 0, 1);

appendOutput('ES6 modules works!');
appendOutput(Component ? 'Preact module loaded (re-export from utils.js)' : 'Preact module isn\'t loaded');
appendOutput(`Map: ${someMap}`);
appendOutput(`Instance Es6 class: ${exampleInstance}`);


