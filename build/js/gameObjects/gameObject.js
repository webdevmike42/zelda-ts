import { NULL_ANIMATION } from "../animation.js";
import { createBox } from "../box.js";
import { getCollidingSolidGameObjects, getProspectedCollisionBox, getCollisionBox } from "../collisions.js";
import { isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { createVector, NULL_VECTOR, vectorDiff, vectorSum } from "../vector.js";
import { getGameObjects } from "./gameObjectFactory.js";
export var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["PLAYER"] = 0] = "PLAYER";
    GameObjectType[GameObjectType["ITEM"] = 1] = "ITEM";
    GameObjectType[GameObjectType["CONVEYOR"] = 2] = "CONVEYOR";
    GameObjectType[GameObjectType["TELEPORTER"] = 3] = "TELEPORTER";
    GameObjectType[GameObjectType["DUMMY"] = 4] = "DUMMY";
})(GameObjectType || (GameObjectType = {}));
export function getCurrentAnimation(gameObject) {
    return gameObject.currentAnimation || gameObject.defaultAnimation || Object.assign({}, NULL_ANIMATION);
}
export function setCurrentAnimation(gameObject, animation) {
    gameObject.currentAnimation = animation;
}
export function setPosition(gameObject, newPosition) {
    gameObject.position = Object.assign({}, newPosition);
}
export function setBounds(gameObject, width, height) {
    gameObject.width = width;
    gameObject.height = height;
}
export function getBoundingBox(gameObject) {
    return createBox(gameObject.position.x, gameObject.position.y, gameObject.width, gameObject.height);
}
export function getPosition(gameObject) {
    return gameObject.position;
}
export function setMovementVector(gameObject, movementVector) {
    gameObject.movementVector = Object.assign({}, movementVector);
}
export function getMovementVector(gameObject) {
    return gameObject.movementVector;
}
export function setViewVector(gameObject, viewVector) {
    gameObject.viewVector = Object.assign({}, viewVector);
}
export function getViewVector(gameObject) {
    return gameObject.viewVector;
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
    gameObject.collisionBox.position = vectorSum(gameObject.collisionBox.position, moveBy);
}
export function setGameObjectPosition(gameObject, newPosition) {
    const diffVector = vectorDiff(newPosition, getPosition(gameObject));
    if (getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), getGameObjects()).length === 0) {
        moveGameObject(gameObject, diffVector);
    }
}
