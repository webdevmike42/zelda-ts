
import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, setDesignatedState, State, switchToState } from "../state.js";
import { createVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getOverallVector, getPosition, setBounds, setMovementVector, setPosition } from "./gameObject.js";
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
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "push box idle state";
    state.enter = () => {
        setMovementVector(pushBox, { ...NULL_VECTOR });
        setCurrentAnimation(pushBox, getAnimation(pushBox, CommonStateTypes.IDLE));
    }
    state.update = () => {
    }
    state.exit = () => {
    };
    return state;
}

function createPushBoxPushedState(pushBox: GameObject): State {
    let pushingGameObject: GameObject | null = null;
    const state: State = createEmptyState(PushBoxStates.PUSHED);
    state.name = "push box pushed state";
    state.enter = () => {
        pushBox.ignoreConveyor = true;
        if (pushBox.stateArgs.length > 0) {
            pushingGameObject = pushBox.stateArgs[0] as GameObject;
        }
        setCurrentAnimation(pushBox, getAnimation(pushBox, PushBoxStates.PUSHED));
    }
    state.update = () => {
        if (pushingGameObject !== null)
            setMovementVector(pushBox, getOverallVector(pushingGameObject));
    }
    state.exit = () => {
        pushingGameObject = null;
        pushBox.ignoreConveyor = false;

    };
    return state;
}

export function grabPushBox(pushBox: GameObject, pushingGameObject: GameObject): void {
    setDesignatedState(pushBox, getState(pushBox, PushBoxStates.PUSHED), [pushingGameObject]);
}

export function releasePushBox(pushBox: GameObject): void {
    setDesignatedState(pushBox, getState(pushBox, CommonStateTypes.IDLE));
}