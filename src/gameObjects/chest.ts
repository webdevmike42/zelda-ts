import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";
import { Item } from "./item.js";

const SMALL_CHEST_WIDTH = 16, SMALL_CHEST_HEIGHT = 16;

export interface Chest extends GameObject {
    isOpen: boolean,
    isLocked: boolean,
    item: Item
}

enum ChestStates {
    OPEN = "Open",
    CLOSED = "Closed"
}

export function createSmallChest(x: number, y: number, isLocked: boolean = false, isOpen: boolean = false): Chest {
    const smallChest: Chest = createChest(x,y,SMALL_CHEST_WIDTH, SMALL_CHEST_HEIGHT,isLocked,isOpen);
    addSmallChestAnimations(smallChest);
    proposeDesignatedState(smallChest, getState(smallChest, isOpen ? ChestStates.OPEN : ChestStates.CLOSED));
    return smallChest;
}

function createChest(x: number, y: number, width: number, height: number, isLocked: boolean = false, isOpen: boolean = false): Chest {
    const chest: Chest = createGameObject(GameObjectType.CHEST) as Chest;
    setPosition(chest, createVector(x, y));
    setBounds(chest, width, height);
    setSolid(chest);
    addChestStates(chest);
    setCollisionBoxFromBoundingBox(chest);
    chest.isOpen = isOpen;
    chest.isLocked = isLocked;
    return chest;
}

function addChestStates(chest: Chest): void {
    const closedState: State = createChestClosedState(chest);
    addState(chest, ChestStates.OPEN, createChestOpenState(chest));
    addState(chest, ChestStates.CLOSED, closedState);
    setDefaultState(chest, closedState);
}

function addSmallChestAnimations(smallChest: Chest): void {
    addAnimation(smallChest, createAnimation(ChestStates.OPEN, "./resources/gfx/objects.png", getPosition(smallChest), smallChest.width, smallChest.height, [{ srcX: 16, srcY: 0 }], 1, false));
    addAnimation(smallChest, createAnimation(ChestStates.CLOSED, "./resources/gfx/objects.png", getPosition(smallChest), smallChest.width, smallChest.height, [{ srcX: 0, srcY: 0 }], 1, false));
}

function createChestOpenState(chest: Chest): State {
    const state: State = createEmptyState(ChestStates.OPEN);
    state.name = "chest open state";
    state.enter = () => {
        console.log("enter " + state.name)
        console.log(chest.animations)
        chest.isOpen = true;
        setCurrentAnimation(chest, getAnimation(chest, ChestStates.OPEN));
    }
    state.update = () => {

    }
    state.exit = () => {
    };
    return state;
}

function createChestClosedState(chest: Chest): State {
    const state: State = createEmptyState(ChestStates.CLOSED);
    state.name = "chest closed state";
    state.enter = () => {
        console.log("enter " + state.name)
        chest.isOpen = false;
        setCurrentAnimation(chest, getAnimation(chest, ChestStates.CLOSED));
    }
    state.update = () => {

    }
    state.exit = () => {
    };
    return state;
}


export function openChest(chest: Chest): void {
    proposeDesignatedState(chest, getState(chest, ChestStates.OPEN));
}

export function closeChest(chest: Chest): void {
    proposeDesignatedState(chest, getState(chest, ChestStates.CLOSED));
}