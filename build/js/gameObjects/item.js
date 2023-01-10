import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject, filterGameObjects } from "./gameObjectFactory.js";
export var ItemType;
(function (ItemType) {
    ItemType[ItemType["SWORD"] = 0] = "SWORD";
})(ItemType || (ItemType = {}));
function createItem(x, y, width, height, itemType, isMajorItem, isCollectable = true) {
    const item = createGameObject(GameObjectType.ITEM);
    setPosition(item, createVector(x, y));
    setBounds(item, width, height);
    setCollisionBoxFromBoundingBox(item);
    setItemType(item, itemType);
    item.isMajorItem = isMajorItem;
    item.isCollectable = isCollectable;
    return item;
}
export function createSword(x, y) {
    const sword = createItem(x, y, 8, 16, ItemType.SWORD, true);
    addSwordAnimations(sword);
    addSwordStates(sword);
    switchToState(sword, getState(sword, CommonStateTypes.IDLE));
    return sword;
}
function addSwordAnimations(sword) {
    sword.animations = new Map();
    addAnimation(sword, createAnimation("idle", "./resources/pausescreen.png", getPosition(sword), sword.width, sword.height, [{ srcX: 555, srcY: 137 }], 1, false));
}
function addSwordStates(sword) {
    const idleState = createItemIdleState(sword);
    addState(sword, CommonStateTypes.IDLE, idleState);
    setDefaultState(sword, idleState);
}
function createItemIdleState(item) {
    const state = createEmptyState();
    state.name = "item idle state";
    state.type = CommonStateTypes.IDLE;
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(item, getAnimation(item, "idle"));
    };
    state.update = () => {
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
function createItemPickedUpState(item) {
    const state = createEmptyState();
    state.name = "item picked up state";
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(item, getAnimation(item, "idle"));
    };
    state.update = () => {
    };
    state.exit = () => {
        console.log("exit " + state.name);
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
    return getCollidingItems(gameObject).filter(item => item.isCollectable);
}