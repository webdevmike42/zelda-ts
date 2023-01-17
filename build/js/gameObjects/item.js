import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition, setVisible } from "./gameObject.js";
import { createGameObject, filterGameObjects } from "./gameObjectFactory.js";
export var ItemType;
(function (ItemType) {
    ItemType[ItemType["SWORD"] = 0] = "SWORD";
    ItemType[ItemType["SMALL_KEY"] = 1] = "SMALL_KEY";
})(ItemType || (ItemType = {}));
var ItemState;
(function (ItemState) {
    ItemState["COLLECTED"] = "Collected";
})(ItemState || (ItemState = {}));
function createItem(x, y, width, height, itemType, isMajorItem, amount = 1, isCollected = false) {
    const item = createGameObject(GameObjectType.ITEM);
    setPosition(item, createVector(x, y));
    setBounds(item, width, height);
    setCollisionBoxFromBoundingBox(item);
    setItemType(item, itemType);
    item.isMajorItem = isMajorItem;
    item.isCollected = isCollected;
    item.amount = amount;
    return item;
}
function createCollectableMinorItem(x, y, width, height, itemType, amount = 1) {
    const minorItem = createItem(x, y, width, height, itemType, false, amount);
    addItemStates(minorItem);
    return minorItem;
}
function createCollectableMajorItem(x, y, width, height, itemType) {
    const majorItem = createItem(x, y, width, height, itemType, true, 1);
    addItemStates(majorItem);
    return majorItem;
}
function addItemStates(item) {
    const idleState = createItemIdleState(item);
    addState(item, CommonStateTypes.IDLE, idleState);
    setDefaultState(item, idleState);
}
export function createSmallKey(x, y) {
    const smallKey = createCollectableMinorItem(x, y, 8, 16, ItemType.SMALL_KEY);
    addAnimation(smallKey, createAnimation("idle", "./resources/pausescreen.png", getPosition(smallKey), smallKey.width, smallKey.height, [{ srcX: 555, srcY: 137 }], 1, false));
    switchToState(smallKey, getState(smallKey, CommonStateTypes.IDLE));
    console.log(smallKey);
    return smallKey;
}
export function createSword(x, y) {
    const sword = createCollectableMajorItem(x, y, 8, 16, ItemType.SWORD);
    addAnimation(sword, createAnimation("idle", "./resources/pausescreen.png", getPosition(sword), sword.width, sword.height, [{ srcX: 555, srcY: 137 }], 1, false));
    switchToState(sword, getState(sword, CommonStateTypes.IDLE));
    return sword;
}
function createItemIdleState(item) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "item idle state";
    state.enter = () => {
        setCurrentAnimation(item, getAnimation(item, "idle"));
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
function createItemCollectedState(item) {
    const state = createEmptyState(ItemState.COLLECTED);
    state.name = "item picked up state";
    state.enter = () => {
        setVisible(item, false);
        setCurrentAnimation(item, getAnimation(item, "idle"));
    };
    state.update = () => {
    };
    state.exit = () => {
    };
    return state;
}
function setItemType(item, itemType) {
    item.itemType = itemType;
}
function getCollidingItems(gameObject) {
    return getCollidingGameObjects(gameObject, getCollisionBox(gameObject), filterGameObjects(GameObjectType.ITEM, getCurrentGameObjects()));
}
export function getCollidingCollectableItems(gameObject) {
    return getCollidingItems(gameObject).filter(item => !item.isCollected);
}
