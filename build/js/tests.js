import { testAnimation } from "./animation.js";
import { testCollisions } from "./collisions.js";
import { testGameObjectFactory } from "./gameObjects/gameObjectFactory.js";
import { testState } from "./state.js";
const results = [];
function allTestsPassed(testResultArray) {
    return !testResultArray.some(result => result.passed === false);
}
export function runAllTests() {
    testGameObjectFactory();
    testState();
    testAnimation();
    testCollisions();
    printResultsToConsole();
}
function printResultsToConsole() {
    results.forEach(result => {
        if (result.passed)
            console.log(result.text + " passed");
        else
            console.error(result.text + " failed");
    });
    if (allTestsPassed(results))
        console.log("ALL TESTS PASSED!");
}
export function addTestResult(text, passed) {
    results.push({ text: text, passed: passed });
}
