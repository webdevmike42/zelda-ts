import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, setDesignatedState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
var FloorSwitchStates;
(function (FloorSwitchStates) {
    FloorSwitchStates["PRESSED"] = "Pressed";
    FloorSwitchStates["RELEASED"] = "Released";
})(FloorSwitchStates || (FloorSwitchStates = {}));
export function createFloorSwitch(x, y, width, height, staysPressed, onPressed = () => { }, onReleased = () => { }) {
    const floorSwitch = createGameObject(GameObjectType.FLOOR_SWITCH);
    setPosition(floorSwitch, createVector(x, y));
    setBounds(floorSwitch, width, height);
    addFloorSwitchStates(floorSwitch);
    addFloorSwitchAnimations(floorSwitch);
    setCollisionBoxFromBoundingBox(floorSwitch);
    setFloorSwitchPressedCallback(floorSwitch, onPressed);
    setFloorSwitchReleasedCallback(floorSwitch, onReleased);
    floorSwitch.pressed = false;
    floorSwitch.staysPressed = staysPressed;
    switchToState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    return floorSwitch;
}
function addFloorSwitchStates(floorSwitch) {
    const releasedState = createFloorSwitchReleasedState(floorSwitch);
    addState(floorSwitch, FloorSwitchStates.PRESSED, createFloorSwitchPressedState(floorSwitch));
    addState(floorSwitch, FloorSwitchStates.RELEASED, releasedState);
    setDefaultState(floorSwitch, releasedState);
}
function addFloorSwitchAnimations(floorSwitch) {
    floorSwitch.animations = new Map();
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.PRESSED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 103, srcY: 18 }], 1, false));
    addAnimation(floorSwitch, createAnimation(FloorSwitchStates.RELEASED, "./resources/tiles-overworld.png", getPosition(floorSwitch), floorSwitch.width, floorSwitch.height, [{ srcX: 1, srcY: 18 }], 1, false));
}
function createFloorSwitchPressedState(floorSwitch) {
    const state = createEmptyState();
    state.name = "floor switch pressed state";
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.PRESSED));
        floorSwitch.onPressed(floorSwitch);
    };
    state.update = () => {
        if (!floorSwitch.staysPressed && getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length === 0)
            setDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.RELEASED));
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
function createFloorSwitchReleasedState(floorSwitch) {
    const state = createEmptyState();
    state.name = "floor switch released state";
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(floorSwitch, getAnimation(floorSwitch, FloorSwitchStates.RELEASED));
        floorSwitch.onReleased(floorSwitch);
    };
    state.update = () => {
        if (getCollidingGameObjects(floorSwitch, getCollisionBox(floorSwitch), getCurrentGameObjects()).length > 0)
            setDesignatedState(floorSwitch, getState(floorSwitch, FloorSwitchStates.PRESSED));
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
export function setFloorSwitchPressedCallback(floorSwitch, callback) {
    floorSwitch.onPressed = callback;
}
export function setFloorSwitchReleasedCallback(floorSwitch, callback) {
    floorSwitch.onReleased = callback;
}
