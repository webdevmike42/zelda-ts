import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState } from "../state.js";
import { createVector, NULL_VECTOR } from "../vector.js";
import { GameObjectType, getOverallVector, getPosition, setBounds, setMovementVector, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
var PushBoxStates;
(function (PushBoxStates) {
    PushBoxStates["PUSHED"] = "Pushed";
})(PushBoxStates || (PushBoxStates = {}));
const PUSH_BOX_WIDTH = 16, PUSH_BOX_HEIGHT = 16;
export function createPushBox(x, y) {
    const pushBox = createGameObject(GameObjectType.PUSH_BOX);
    setPosition(pushBox, createVector(x, y));
    setBounds(pushBox, PUSH_BOX_WIDTH, PUSH_BOX_HEIGHT);
    addPushBoxStates(pushBox);
    addPushBoxAnimations(pushBox);
    setCollisionBoxFromBoundingBox(pushBox);
    proposeDesignatedState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
    return pushBox;
}
function addPushBoxStates(pushBox) {
    const idleState = createPushBoxIdleState(pushBox);
    addState(pushBox, CommonStateTypes.IDLE, createPushBoxIdleState(pushBox));
    addState(pushBox, PushBoxStates.PUSHED, createPushBoxPushedState(pushBox));
    setDefaultState(pushBox, idleState);
}
function addPushBoxAnimations(pushBox) {
    addAnimation(pushBox, createAnimation(CommonStateTypes.IDLE, "./resources/dungeon-green.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 64, srcY: 80 }], 1, false));
    addAnimation(pushBox, createAnimation(PushBoxStates.PUSHED, "./resources/dungeon-green.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 64, srcY: 80 }], 1, false));
}
function createPushBoxIdleState(pushBox) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "push box idle state";
    state.enter = () => {
        setMovementVector(pushBox, Object.assign({}, NULL_VECTOR));
        setCurrentAnimation(pushBox, getAnimation(pushBox, CommonStateTypes.IDLE));
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
function createPushBoxPushedState(pushBox) {
    let pushingGameObject;
    const state = createEmptyState(PushBoxStates.PUSHED);
    state.name = "push box pushed state";
    state.init = (pushingGameObjectArg) => {
        pushingGameObject = pushingGameObjectArg;
    };
    state.enter = () => {
        pushBox.ignoreConveyor = true;
        setCurrentAnimation(pushBox, getAnimation(pushBox, PushBoxStates.PUSHED));
    };
    state.update = () => {
        setMovementVector(pushBox, getOverallVector(pushingGameObject));
    };
    state.exit = () => {
        pushBox.ignoreConveyor = false;
    };
    return state;
}
export function grabPushBox(pushBox, pushingGameObject) {
    proposeDesignatedState(pushBox, getState(pushBox, PushBoxStates.PUSHED), pushingGameObject);
}
export function releasePushBox(pushBox) {
    proposeDesignatedState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
}
