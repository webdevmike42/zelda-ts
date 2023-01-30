import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";
const SMALL_CHEST_WIDTH = 16, SMALL_CHEST_HEIGHT = 16;
var ChestStates;
(function (ChestStates) {
    ChestStates["OPEN"] = "Open";
    ChestStates["CLOSED"] = "Closed";
})(ChestStates || (ChestStates = {}));
export function createSmallChest(x, y, isLocked = false, isOpen = false) {
    const smallChest = createChest(x, y, SMALL_CHEST_WIDTH, SMALL_CHEST_HEIGHT, isLocked, isOpen);
    addSmallChestAnimations(smallChest);
    proposeDesignatedState(smallChest, getState(smallChest, isOpen ? ChestStates.OPEN : ChestStates.CLOSED));
    return smallChest;
}
function createChest(x, y, width, height, isLocked = false, isOpen = false) {
    const chest = createGameObject(GameObjectType.CHEST);
    setPosition(chest, createVector(x, y));
    setBounds(chest, width, height);
    setSolid(chest);
    addChestStates(chest);
    setCollisionBoxFromBoundingBox(chest);
    chest.isOpen = isOpen;
    chest.isLocked = isLocked;
    return chest;
}
function addChestStates(chest) {
    const closedState = createChestClosedState(chest);
    addState(chest, ChestStates.OPEN, createChestOpenState(chest));
    addState(chest, ChestStates.CLOSED, closedState);
    setDefaultState(chest, closedState);
}
function addSmallChestAnimations(smallChest) {
    addAnimation(smallChest, createAnimation(ChestStates.OPEN, "./resources/gfx/objects.png", getPosition(smallChest), smallChest.width, smallChest.height, [{ srcX: 16, srcY: 0 }], 1, false));
    addAnimation(smallChest, createAnimation(ChestStates.CLOSED, "./resources/gfx/objects.png", getPosition(smallChest), smallChest.width, smallChest.height, [{ srcX: 0, srcY: 0 }], 1, false));
}
function createChestOpenState(chest) {
    const state = createEmptyState(ChestStates.OPEN);
    state.name = "chest open state";
    state.enter = () => {
        console.log("enter " + state.name);
        console.log(chest.animations);
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
        console.log("enter " + state.name);
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
