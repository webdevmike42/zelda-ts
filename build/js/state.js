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
export function switchToState(gameObject, newState) {
    exitCurrentState(gameObject);
    setCurrentState(gameObject, newState);
    enterCurrentState(gameObject);
    //handleGameObjectInput(gameObject);//otherwise, on transition from idle to moving state, very short input will be ignored
}
export function addState(gameObject, key, newState) {
    gameObject.states.set(key, newState);
}
export function getState(gameObject, key) {
    return gameObject.states.get(key) || gameObject.defaultState;
}
export function setCurrentState(gameObject, newState) {
    gameObject.currentState = newState;
}
export function getCurrentState(gameObject) {
    return gameObject.currentState;
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
export function setDesignatedState(gameObject, designatedState) {
    gameObject.designatedState = designatedState;
}
export function testState() {
    /*
    const dummy: GameObject = createTestGameObject();
    console.log(dummy.currentState.name);
    switchToState(dummy, getState(dummy, CommonStates.MOVING));
    console.log(dummy.currentState.name);
    switchToState(dummy, getState(dummy, CommonStates.ACTION));
    console.log(dummy.currentState.name);
    */
}
