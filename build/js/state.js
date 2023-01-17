export var CommonStateTypes;
(function (CommonStateTypes) {
    CommonStateTypes["NULL"] = "Null";
    CommonStateTypes["IDLE"] = "Idle";
    CommonStateTypes["MOVING"] = "Moving";
    CommonStateTypes["ACTION"] = "Action";
    CommonStateTypes["HIT"] = "Hit";
    CommonStateTypes["DEATH"] = "Death";
})(CommonStateTypes || (CommonStateTypes = {}));
export const NULL_STATE = Object.freeze({
    type: CommonStateTypes.NULL,
    name: "NULL_STATE",
    enter: () => { console.log("enter null state"); },
    update: () => { },
    exit: () => { console.log("exit null state"); }
});
export function createEmptyState(type) {
    return Object.assign(Object.assign({}, NULL_STATE), { type: type || CommonStateTypes.NULL });
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
    return gameObject.states.get(key) || gameObject.defaultState || Object.assign({}, NULL_STATE);
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
export function setDesignatedState(gameObject, designatedState, designatedStateArgs) {
    if (gameObject.designatedState === null) {
        gameObject.designatedState = designatedState;
        gameObject.stateArgs = designatedStateArgs || [];
    }
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
