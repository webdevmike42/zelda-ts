import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, setDesignatedState, switchToState } from "../state.js";
import { createVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObjectType, getPosition, setBounds, setMovementVector, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
var PushBoxStates;
(function (PushBoxStates) {
    PushBoxStates["PUSHED"] = "Pushed";
})(PushBoxStates || (PushBoxStates = {}));
export function createPushBox(x, y) {
    const pushBox = createGameObject(GameObjectType.PUSH_BOX);
    setPosition(pushBox, createVector(x, y));
    setBounds(pushBox, 16, 16);
    addPushBoxStates(pushBox);
    addPushBoxAnimations(pushBox);
    setCollisionBoxFromBoundingBox(pushBox);
    //setSolid(pushBox);
    switchToState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
    return pushBox;
}
function addPushBoxStates(pushBox) {
    const idleState = createPushBoxIdleState(pushBox);
    addState(pushBox, CommonStateTypes.IDLE, createPushBoxIdleState(pushBox));
    addState(pushBox, PushBoxStates.PUSHED, createPushBoxPushedState(pushBox));
    setDefaultState(pushBox, idleState);
}
function addPushBoxAnimations(pushBox) {
    addAnimation(pushBox, createAnimation(CommonStateTypes.IDLE, "./resources/link.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(pushBox, createAnimation(PushBoxStates.PUSHED, "./resources/link.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 91, srcY: 0 }], 1, false));
}
function createPushBoxIdleState(pushBox) {
    const state = createEmptyState();
    state.name = "push box idle state";
    state.type = CommonStateTypes.IDLE;
    state.enter = () => {
        console.log("enter: " + state.name);
        setMovementVector(pushBox, Object.assign({}, NULL_VECTOR));
        setCurrentAnimation(pushBox, getAnimation(pushBox, CommonStateTypes.IDLE));
    };
    state.update = () => {
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
function createPushBoxPushedState(pushBox) {
    let movingSpeed = 50;
    const state = createEmptyState();
    state.name = "push box pushed state";
    state.type = PushBoxStates.PUSHED;
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(pushBox, getAnimation(pushBox, PushBoxStates.PUSHED));
    };
    state.update = () => {
        const movementVector = createMovementVector();
        setMovementVector(pushBox, vectorScalarProduct(movingSpeed, movementVector));
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
export function grabPushBox(pushBox, pushingGameObject) {
    setDesignatedState(pushBox, getState(pushBox, PushBoxStates.PUSHED), [pushingGameObject]);
}
export function releasePushBox(pushBox) {
    setDesignatedState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
}
