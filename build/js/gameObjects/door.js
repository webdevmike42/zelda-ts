import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";
var DoorStates;
(function (DoorStates) {
    DoorStates["OPEN"] = "Open";
    DoorStates["CLOSED"] = "Closed";
})(DoorStates || (DoorStates = {}));
;
export function createDoor(x, y, width, height, isOpen) {
    const door = createGameObject(GameObjectType.DOOR);
    console.log("createDoor");
    setPosition(door, createVector(x, y));
    setBounds(door, width, height);
    setSolid(door, !isOpen);
    addDoorStates(door);
    addDoorAnimations(door);
    setCollisionBoxFromBoundingBox(door);
    door.isOpen = isOpen;
    switchToState(door, getState(door, isOpen ? DoorStates.OPEN : DoorStates.CLOSED));
    return door;
}
function addDoorStates(door) {
    const closedState = createDoorClosedState(door);
    addState(door, DoorStates.OPEN, createDoorOpenState(door));
    addState(door, DoorStates.CLOSED, closedState);
    setDefaultState(door, closedState);
}
function addDoorAnimations(door) {
    door.animations = new Map();
    addAnimation(door, createAnimation(DoorStates.OPEN, "./resources/link.png", getPosition(door), door.width, door.height, [{ srcX: 91, srcY: 0 }], 1, false));
    addAnimation(door, createAnimation(DoorStates.CLOSED, "./resources/link.png", getPosition(door), door.width, door.height, [{ srcX: 30, srcY: 0 }], 1, false));
}
function createDoorOpenState(door) {
    const state = createEmptyState(DoorStates.OPEN);
    state.name = "door open state";
    state.enter = () => {
        setCurrentAnimation(door, getAnimation(door, DoorStates.OPEN));
        setSolid(door, false);
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
function createDoorClosedState(door) {
    const state = createEmptyState(DoorStates.CLOSED);
    state.name = "door closed state";
    state.enter = () => {
        setCurrentAnimation(door, getAnimation(door, DoorStates.CLOSED));
        setSolid(door, true);
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
export function openDoor(door) {
    proposeDesignatedState(door, getState(door, DoorStates.OPEN));
}
export function closeDoor(door) {
    proposeDesignatedState(door, getState(door, DoorStates.CLOSED));
}
