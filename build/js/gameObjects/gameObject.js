import { NULL_ANIMATION } from "../animation.js";
import { createBox } from "../box.js";
import { getCollidingSolidGameObjects, getProspectedCollisionBox, getCollisionBox } from "../collisions.js";
import { isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { getCurrentGameObjects } from "../screens.js";
import { createVector, NULL_VECTOR, vectorDiff, vectorSum } from "../vector.js";
import { getCollidingActiveConveyors, getConveyingVectorSum } from "./conveyor.js";
export var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["PLAYER"] = 0] = "PLAYER";
    GameObjectType[GameObjectType["ITEM"] = 1] = "ITEM";
    GameObjectType[GameObjectType["CONVEYOR"] = 2] = "CONVEYOR";
    GameObjectType[GameObjectType["TELEPORTER"] = 3] = "TELEPORTER";
    GameObjectType[GameObjectType["HAZARD"] = 4] = "HAZARD";
    GameObjectType[GameObjectType["DUMMY"] = 5] = "DUMMY";
    GameObjectType[GameObjectType["FLOOR_SWITCH"] = 6] = "FLOOR_SWITCH";
    GameObjectType[GameObjectType["DOOR"] = 7] = "DOOR";
    GameObjectType[GameObjectType["PUSH_BOX"] = 8] = "PUSH_BOX";
})(GameObjectType || (GameObjectType = {}));
export function getCurrentAnimation(gameObject) {
    return gameObject.currentAnimation || gameObject.defaultAnimation || Object.assign({}, NULL_ANIMATION);
}
export function setCurrentAnimation(gameObject, animation) {
    gameObject.currentAnimation = animation;
}
export function setPosition(object, newPosition) {
    object.position = Object.assign({}, newPosition);
}
export function setBounds(gameObject, width, height) {
    gameObject.width = width;
    gameObject.height = height;
}
export function getBoundingBox(gameObject) {
    return createBox(gameObject.position.x, gameObject.position.y, gameObject.width, gameObject.height);
}
export function getPosition(object) {
    return object.position;
}
export function setMovementVector(gameObject, movementVector) {
    gameObject.movementVector = Object.assign({}, movementVector);
}
export function getMovementVector(gameObject) {
    return gameObject.movementVector;
}
export function getOverallVector(gameObject) {
    return vectorSum(getMovementVector(gameObject), getConveyingVectorSum(getCollidingActiveConveyors(gameObject)));
}
export function setViewVector(gameObject, viewVector) {
    gameObject.viewVector = Object.assign({}, viewVector);
}
export function getViewVector(gameObject) {
    return gameObject.viewVector;
}
export function getCenter(gameObject) {
    const position = getPosition(gameObject);
    return createVector(position.x + Math.floor(gameObject.width / 2), position.y + Math.floor(gameObject.height / 2));
}
export function createMovementVector() {
    let movementVector = Object.assign({}, NULL_VECTOR);
    if (isKeyDown(KEYS.UP))
        movementVector = vectorSum(movementVector, createVector(0, -1));
    if (isKeyDown(KEYS.LEFT))
        movementVector = vectorSum(movementVector, createVector(-1, 0));
    if (isKeyDown(KEYS.DOWN))
        movementVector = vectorSum(movementVector, createVector(0, 1));
    if (isKeyDown(KEYS.RIGHT))
        movementVector = vectorSum(movementVector, createVector(1, 0));
    return movementVector;
}
export function isMoving(movementVector) {
    return movementVector.x !== 0 || movementVector.y !== 0;
}
export function moveGameObject(gameObject, moveBy) {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy);
    if (gameObject.hitBox)
        gameObject.hitBox.position = vectorSum(gameObject.hitBox.position, moveBy);
    if (gameObject.hurtBox)
        gameObject.hurtBox.position = vectorSum(gameObject.hurtBox.position, moveBy);
    gameObject.collisionBox.position = vectorSum(gameObject.collisionBox.position, moveBy);
}
function move(position, moveBy) {
    position = vectorSum(position, moveBy);
}
export function setGameObjectPosition(gameObject, newPosition) {
    const diffVector = vectorDiff(newPosition, getPosition(gameObject));
    if (getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), getCurrentGameObjects()).length === 0) {
        moveGameObject(gameObject, diffVector);
    }
}
export function setHealth(gameObject, health) {
    gameObject.health = health;
}
export function setMaxHealth(gameObject, maxHealth) {
    gameObject.maxHealth = maxHealth;
}
export function isGameObjectDead(gameObject) {
    return getHealth(gameObject) <= 0;
}
export function getHealth(gameObject) {
    return gameObject.health || 0;
}
export function setVisible(gameObject, isVisible) {
    gameObject.isVisible = isVisible;
}
export function isVisible(gameObject) {
    return gameObject.isVisible || false;
}
