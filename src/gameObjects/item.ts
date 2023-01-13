import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setPosition, setVisible } from "./gameObject.js";
import { createGameObject, filterGameObjects } from "./gameObjectFactory.js";

export enum ItemType {
    SWORD,
    SMALL_KEY
}

export interface Item extends GameObject {
    itemType: ItemType,
    isMajorItem: boolean,
    isCollected: boolean,
    amount:number
}

function createItem(x: number, y: number, width: number, height: number, itemType: ItemType, isMajorItem: boolean, amount:number = 1, isCollected = false): Item {
    const item: Item = createGameObject(GameObjectType.ITEM) as Item;
    setPosition(item, createVector(x, y));
    setBounds(item, width, height);
    setCollisionBoxFromBoundingBox(item);
    setItemType(item, itemType);
    item.isMajorItem = isMajorItem;
    item.isCollected = isCollected;
    item.amount = amount;
    return item;
}

function createCollectableMinorItem(x: number, y: number, width: number, height: number, itemType: ItemType, amount:number = 1): Item {
    const minorItem: Item = createItem(x, y, width, height, itemType, false, amount);
    addItemStates(minorItem);
    return minorItem;
}

function createCollectableMajorItem(x: number, y: number, width: number, height: number, itemType: ItemType): Item {
    const majorItem: Item = createItem(x, y, width, height, itemType, true, 1);
    addItemStates(majorItem);
    return majorItem;
}

function addItemStates(item: Item): void {
    const idleState: State = createItemIdleState(item);
    addState(item, CommonStateTypes.IDLE, idleState);
    setDefaultState(item, idleState);
}

export function createSmallKey(x: number, y: number): Item {
    const smallKey: Item = createCollectableMinorItem(x, y, 8, 16, ItemType.SMALL_KEY);
    addAnimation(smallKey, createAnimation("idle", "./resources/pausescreen.png", getPosition(smallKey), smallKey.width, smallKey.height, [{ srcX: 555, srcY: 137 }], 1, false));
    switchToState(smallKey, getState(smallKey, CommonStateTypes.IDLE));
    console.log(smallKey)
    return smallKey;
}

export function createSword(x: number, y: number): Item {
    const sword: Item = createCollectableMajorItem(x, y, 8, 16, ItemType.SWORD);
    addAnimation(sword, createAnimation("idle", "./resources/pausescreen.png", getPosition(sword), sword.width, sword.height, [{ srcX: 555, srcY: 137 }], 1, false));
    switchToState(sword, getState(sword, CommonStateTypes.IDLE));
    return sword;
}

function createItemIdleState(item: Item): State {
    const state: State = createEmptyState();
    state.name = "item idle state";
    state.type = CommonStateTypes.IDLE;
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

function createItemCollectedState(item: Item): State {
    const state: State = createEmptyState();
    state.name = "item picked up state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setVisible(item,false);
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

function getCollidingItems(gameObject: GameObject): Item[] {
    return getCollidingGameObjects(gameObject, getCollisionBox(gameObject), filterGameObjects(GameObjectType.ITEM, getCurrentGameObjects())) as Item[];
}

export function getCollidingCollectableItems(gameObject: GameObject): Item[] {
    return getCollidingItems(gameObject).filter(item => !item.isCollected);
}