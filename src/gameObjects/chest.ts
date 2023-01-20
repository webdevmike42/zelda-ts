import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";
import { Item } from "./item.js";

export interface Chest extends GameObject{
    isOpen:boolean,
    isLocked:boolean,
    item:Item
}

enum ChestStates {
    OPEN = "Open",
    CLOSED = "Closed"
}

export function createChest(x: number, y: number, isLocked:boolean = false, isOpen: boolean = false): Chest {
    const chest:Chest = createGameObject(GameObjectType.CHEST) as Chest;
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

function addChestStates(chest: Chest): void {
    const closedState: State = createChestClosedState(chest);
    addState(chest, ChestStates.OPEN, createChestOpenState(chest));
    addState(chest, ChestStates.CLOSED, closedState);
    setDefaultState(chest, closedState);
}

function addChestAnimations(chest: Chest): void {
    chest.animations = new Map<string, Animation>();
    addAnimation(chest, createAnimation(ChestStates.OPEN, "./resources/link.png", getPosition(chest), chest.width, chest.height, [{ srcX: 91, srcY: 0 }], 1, false));
    addAnimation(chest, createAnimation(ChestStates.CLOSED, "./resources/link.png", getPosition(chest), chest.width, chest.height, [{ srcX: 30, srcY: 0 }], 1, false));
}

function createChestOpenState(chest: Chest): State {
    const state: State = createEmptyState(ChestStates.OPEN);
    state.name = "chest open state";
    state.enter = () => {
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
        chest.isOpen = false;
        setCurrentAnimation(chest, getAnimation(chest, ChestStates.CLOSED));
    }
    state.update = () => {
        
    }
    state.exit = () => {
    };
    return state;
}


export function openChest(chest:Chest):void{
    proposeDesignatedState(chest,getState(chest, ChestStates.OPEN));
}

export function closeChest(chest:Chest):void{
    proposeDesignatedState(chest,getState(chest, ChestStates.CLOSED));
}