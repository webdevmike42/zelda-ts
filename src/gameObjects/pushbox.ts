
import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, setDesignatedState, State, switchToState } from "../state.js";
import { createVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getPosition, setBounds, setMovementVector, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";

enum PushBoxStates {
    PUSHED = "Pushed"
}

export function createPushBox(x: number, y: number): GameObject {
    const pushBox: GameObject = createGameObject(GameObjectType.PUSH_BOX);
    setPosition(pushBox, createVector(x, y));
    setBounds(pushBox, 16, 16);
    addPushBoxStates(pushBox);
    addPushBoxAnimations(pushBox);
    setCollisionBoxFromBoundingBox(pushBox);
    //setSolid(pushBox);
    switchToState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
    return pushBox;
}

function addPushBoxStates(pushBox: GameObject): void {
    const idleState: State = createPushBoxIdleState(pushBox);
    addState(pushBox, CommonStateTypes.IDLE, createPushBoxIdleState(pushBox));
    addState(pushBox, PushBoxStates.PUSHED, createPushBoxPushedState(pushBox));
    setDefaultState(pushBox, idleState);
}

function addPushBoxAnimations(pushBox: GameObject): void {
    addAnimation(pushBox, createAnimation(CommonStateTypes.IDLE, "./resources/link.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(pushBox, createAnimation(PushBoxStates.PUSHED, "./resources/link.png", getPosition(pushBox), pushBox.width, pushBox.height, [{ srcX: 91, srcY: 0 }], 1, false));
}

function createPushBoxIdleState(pushBox: GameObject): State {
    const state: State = createEmptyState();
    state.name = "push box idle state";
    state.type = CommonStateTypes.IDLE;
    state.enter = () => {
        console.log("enter: " + state.name)
        setMovementVector(pushBox, { ...NULL_VECTOR });
        setCurrentAnimation(pushBox, getAnimation(pushBox, CommonStateTypes.IDLE));
    }
    state.update = () => {
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function createPushBoxPushedState(pushBox: GameObject): State {
    let movingSpeed: number = 50;
    const state: State = createEmptyState();
    state.name = "push box pushed state";
    state.type = PushBoxStates.PUSHED;
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(pushBox, getAnimation(pushBox, PushBoxStates.PUSHED));
    }
    state.update = () => {
        const movementVector = createMovementVector();
        setMovementVector(pushBox, vectorScalarProduct(movingSpeed, movementVector));
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

export function grabPushBox(pushBox: GameObject, pushingGameObject: GameObject): void {
    setDesignatedState(pushBox, getState(pushBox, PushBoxStates.PUSHED), [pushingGameObject]);
}

export function releasePushBox(pushBox: GameObject): void {
    setDesignatedState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
}