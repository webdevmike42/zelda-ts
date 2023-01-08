import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject, filterGameObjects } from "./gameObjectFactory.js";

export enum ItemType {
    SWORD
}

export interface Item extends GameObject {
    itemType: ItemType
}

function createItem(x: number, y: number, width: number, height: number, itemType: ItemType): Item {
    const item: Item = createGameObject(GameObjectType.ITEM) as Item;
    setPosition(item, createVector(x, y));
    setBounds(item, width, height);
    setCollisionBoxFromBoundingBox(item);
    setItemType(item, itemType);
    return item;
}

export function createSword(x: number, y: number): Item {
    const sword: Item = createItem(x, y, 8, 16, ItemType.SWORD);
    addSwordAnimations(sword);
    addSwordStates(sword);
    switchToState(sword, getState(sword, CommonStateTypes.IDLE));
    return sword;
}

function addSwordAnimations(sword: Item): void {
    sword.animations = new Map<string, Animation>();
    addAnimation(sword, createAnimation("idle", "./resources/pausescreen.png", getPosition(sword), sword.width, sword.height, [{ srcX: 555, srcY: 137 }], 1, false));
}

function addSwordStates(sword: Item): void {
    const idleState: State = createItemIdleState(sword);
    addState(sword, CommonStateTypes.IDLE, idleState);
    setDefaultState(sword, idleState);
}

function createItemIdleState(item: Item): State {
    const state: State = createEmptyState();
    state.name = "item idle state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(item, getAnimation(item, "idle"));
    }
    state.update = () => {
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function createItemPickedUpState(item: Item): State {
    const state: State = createEmptyState();
    state.name = "item picked up state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(item, getAnimation(item, "idle"));
    }
    state.update = () => {
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function setItemType(item: Item, itemType: ItemType): void {
    item.itemType = itemType;
}

export function getCollidingItems(gameObject: GameObject): Item[] {
    return getCollidingGameObjects(gameObject, getCollisionBox(gameObject), filterGameObjects(GameObjectType.ITEM, getCurrentGameObjects())) as Item[];
}