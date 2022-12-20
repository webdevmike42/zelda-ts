import { createTestGameObject } from "./gameObjects/gameObjectFactory.js";
export var CommonStates;
(function (CommonStates) {
    CommonStates["IDLE"] = "idle";
    CommonStates["MOVING"] = "moving";
    CommonStates["ACTION"] = "action";
})(CommonStates || (CommonStates = {}));
export const NULL_STATE = Object.freeze({
    name: "NULL_STATE",
    enter: () => { console.log("enter null state"); },
    update: () => { },
    exit: () => { console.log("exit null state"); }
});
export function createEmptyState() {
    return Object.assign({}, NULL_STATE);
}
export function switchToState(gameObject, newStateKey) {
    exitCurrentState(gameObject);
    setCurrentState(gameObject, getState(gameObject, newStateKey));
    enterCurrentState(gameObject);
    //handleGameObjectInput(gameObject);//otherwise, on transition from idle to moving state, very short input will be ignored
}
export function addState(gameObject, key, newState, isCurrentState, isDefaultState) {
    gameObject.states.set(key, newState);
    if (isCurrentState)
        setCurrentState(gameObject, newState);
    if (isDefaultState)
        setDefaultState(gameObject, newState);
}
export function getState(gameObject, key) {
    return gameObject.states.get(key) || gameObject.defaultState;
}
export function setCurrentState(gameObject, newState) {
    gameObject.currentState = newState;
}
export function setDefaultState(gameObject, newState) {
    gameObject.defaultState = newState;
}
function enterCurrentState(gameObject) {
    gameObject.currentState.enter();
}
function exitCurrentState(gameObject) {
    gameObject.currentState.exit();
}
export function testState() {
    const dummy = createTestGameObject();
    console.log(dummy.currentState.name);
    switchToState(dummy, CommonStates.MOVING);
    console.log(dummy.currentState.name);
    switchToState(dummy, CommonStates.ACTION);
    console.log(dummy.currentState.name);
}
