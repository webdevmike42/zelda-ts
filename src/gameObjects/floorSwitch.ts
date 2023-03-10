
import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, State } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject} from "./gameObjectFactory.js";

export interface FloorSwitch extends GameObject {
    pressed: boolean,
    staysPressed: boolean,
    onPressed: Function,
    onReleased: Function
}

enum FloorSwitchStates {
    PRESSED = "Pressed",
    RELEASED = "Released"
}

export function createFloorSwitch(x: number, y: number, width: number, height: number, staysPressed: boolean, onPressed: Function = () => { }, onReleased: Function = () => { }): FloorSwitch {
    const floorSwitch: FloorSwitch = createGameObject(GameObjectType.FLOOR_SWITCH) as FloorSwitch;
    setPosition(floorSwitch, createVector(x, y));
    setBounds(floorSwitch, width, height);
    addFloorSwitchStates(floorSwitch);
    addFloorSwitchAnimations(floorSwitch);
    setCollisionBoxFromBoundingBox(floorSwitch);
    setFloorSwitchPressedCallback(floorSwitch, onPressed);
    setFloorSwitchReleasedCallback(floorSwitch, onReleased);
    floorSwitch.pressed = false;
    floorSwitch.staysPressed = staysPressed;
    proposeDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    return floorSwitch;
}

function addFloorSwitchStates(floorSwitch: FloorSwitch): void {
    const releasedState: State = createFloorSwitchReleasedState(floorSwitch);
    addState(floorSwitch, FloorSwitchStates.PRESSED, createFloorSwitchPressedState(floorSwitch));
    addState(floorSwitch, FloorSwitchStates.RELEASED, releasedState);
    setDefaultState(floorSwitch, releasedState);
}

function addFloorSwitchAnimations(floorSwitch: FloorSwitch): void {
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.PRESSED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 103, srcY: 18 }], 1, false));
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.RELEASED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 1, srcY: 18 }], 1, false));
}

function createFloorSwitchPressedState(floorSwitch: FloorSwitch): State {
    const state: State = createEmptyState(FloorSwitchStates.PRESSED);
    state.name = "floor switch pressed state";
    state.enter = () => {
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.PRESSED));
        floorSwitch.onPressed(floorSwitch);
    }
    state.update = () => {
        if (!floorSwitch.staysPressed && getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length === 0)
            proposeDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    }
    state.exit = () => {
    };
    return state;
}

function createFloorSwitchReleasedState(floorSwitch: FloorSwitch): State {
    const state: State = createEmptyState(FloorSwitchStates.RELEASED);
    state.name = "floor switch released state";
    state.enter = () => {
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.RELEASED));
        floorSwitch.onReleased(floorSwitch);
    }
    state.update = () => {
        if (getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length > 0)
            proposeDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.PRESSED));
    }
    state.exit = () => {
    };
    return state;
}

export function setFloorSwitchPressedCallback(floorSwitch: FloorSwitch, callback: Function): void {
    floorSwitch.onPressed = callback;
}

export function setFloorSwitchReleasedCallback(floorSwitch: FloorSwitch, callback: Function): void {
    floorSwitch.onReleased = callback;
}