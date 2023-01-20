import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";
var ChestStates;
(function (ChestStates) {
    ChestStates["OPEN"] = "Open";
    ChestStates["CLOSED"] = "Closed";
})(ChestStates || (ChestStates = {}));
export function createChest(x, y, isLocked = false, isOpen = false) {
    const chest = createGameObject(GameObjectType.CHEST);
    setPosition(chest, createVector(x, y));
    setBounds(chest, 16, 16);
    setSolid(chest);
    addChestStates(chest);
    addChestAnimations(chest);
    setCollisionBoxFromBoundingBox(chest);
    chest.isOpen = isOpen;
    chest.isLocked = isLocked;
    switchToState(chest, getState(chest, isOpen ? ChestStates.OPEN : ChestStates.CLOSED));
    return chest;
}
function addChestStates(chest) {
    const closedState = createChestClosedState(chest);
    addState(chest, ChestStates.OPEN, createChestOpenState(chest));
    addState(chest, ChestStates.CLOSED, closedState);
    setDefaultState(chest, closedState);
}
function addChestAnimations(chest) {
    chest.animations = new Map();
    addAnimation(chest, createAnimation(ChestStates.OPEN, "./resources/link.png", getPosition(chest), chest.width, chest.height, [{ srcX: 91, srcY: 0 }], 1, false));
    addAnimation(chest, createAnimation(ChestStates.CLOSED, "./resources/link.png", getPosition(chest), chest.width, chest.height, [{ srcX: 30, srcY: 0 }], 1, false));
}
function createChestOpenState(chest) {
    const state = createEmptyState(ChestStates.OPEN);
    state.name = "chest open state";
    state.enter = () => {
        chest.isOpen = true;
        setCurrentAnimation(chest, getAnimation(chest, ChestStates.OPEN));
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
function createChestClosedState(chest) {
    const state = createEmptyState(ChestStates.CLOSED);
    state.name = "chest closed state";
    state.enter = () => {
        chest.isOpen = false;
        setCurrentAnimation(chest, getAnimation(chest, ChestStates.CLOSED));
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
export function openChest(chest) {
    proposeDesignatedState(chest, getState(chest, ChestStates.OPEN));
}
export function closeChest(chest) {
    proposeDesignatedState(chest, getState(chest, ChestStates.CLOSED));
}
