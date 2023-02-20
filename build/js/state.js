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
    init: () => { },
    enter: () => { },
    update: () => { },
    exit: () => { }
});
export function createEmptyState(type) {
    return Object.assign(Object.assign({}, NULL_STATE), { type: type || CommonStateTypes.NULL });
}
export function createEmptyHitState() {
    return createEmptyState(CommonStateTypes.HIT);
}
export function switchToState(gameObject, newState) {
    exitCurrentState(gameObject);
    setCurrentState(gameObject, newState);
    enterCurrentState(gameObject);
    clearDesignatedState(gameObject);
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
export function proposeDesignatedState(gameObject, designatedState, ...designatedStateArgs) {
    setDesignatedState(gameObject, designatedState);
    initState(designatedState, ...designatedStateArgs);
}
function setDesignatedState(gameObject, designatedState) {
    gameObject.designatedState = designatedState;
}
function clearDesignatedState(gameObject) {
    setDesignatedState(gameObject, Object.assign({}, NULL_STATE));
}
export function hasDesignatedState(gameObject) {
    return gameObject.designatedState.type !== CommonStateTypes.NULL;
}
export function initState(state, ...stateArgs) {
    state.init(...stateArgs);
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
