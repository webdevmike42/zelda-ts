
import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { EMPTY_SCREEN_ID, getCurrentGameObjects, switchToScreen } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, setDesignatedState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";

export interface FloorSwitch extends GameObject {
    pressed: boolean,
    staysPressed: boolean
}

enum FloorSwitchStates {
    PRESSED = "Pressed",
    RELEASED = "Released"
}

export function createFloorSwitch(x: number, y: number, width: number, height: number, staysPressed: boolean): FloorSwitch {
    const floorSwitch: FloorSwitch = createGameObject(GameObjectType.FLOOR_SWITCH) as FloorSwitch;
    setPosition(floorSwitch, createVector(x, y));
    setBounds(floorSwitch, width, height);
    addFloorSwitchStates(floorSwitch);
    addFloorSwitchAnimations(floorSwitch);
    setCollisionBoxFromBoundingBox(floorSwitch);
    floorSwitch.pressed = false;
    floorSwitch.staysPressed = staysPressed;
    switchToState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    return floorSwitch;
}

function addFloorSwitchStates(floorSwitch: FloorSwitch): void {
    const releasedState: State = createFloorSwitchReleasedState(floorSwitch);
    addState(floorSwitch, FloorSwitchStates.PRESSED, createFloorSwitchPressedState(floorSwitch));
    addState(floorSwitch, FloorSwitchStates.RELEASED, releasedState);
    setDefaultState(floorSwitch, releasedState);
}

function addFloorSwitchAnimations(floorSwitch: FloorSwitch): void {
    floorSwitch.animations = new Map<string, Animation>();
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.PRESSED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 103, srcY: 18 }], 1, false));
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.RELEASED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 1, srcY: 18 }], 1, false));
}

function createFloorSwitchPressedState(floorSwitch: FloorSwitch): State {
    const state: State = createEmptyState();
    state.name = "floor switch pressed state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.PRESSED));
    }
    state.update = () => {
        if (getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length === 0)
            setDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function createFloorSwitchReleasedState(floorSwitch: FloorSwitch): State {
    const state: State = createEmptyState();
    state.name = "floor switch released state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.RELEASED));
    }
    state.update = () => {
        if (getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length > 0)
            setDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.PRESSED));
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}