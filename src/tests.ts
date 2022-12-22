import { testAnimation } from "./animation.js";
import { testCollisions } from "./collisions.js";
import { testGameObjectFactory } from "./gameObjects/gameObjectFactory.js";
import { testState } from "./state.js";

export interface TestResult {
    text: string,
    passed: boolean
}

const results: TestResult[] = [];

function allTestsPassed(testResultArray: TestResult[]) {
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

    if(allTestsPassed(results))
        console.log("ALL TESTS PASSED!")
}

export function addTestResult(text: string, passed: boolean): void {
    results.push({ text: text, passed: passed });
}