import { NULL_ANIMATION } from "../animation.js";
import { isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { createVector, NULL_VECTOR, vectorSum } from "../vector.js";
export var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["PLAYER"] = 0] = "PLAYER";
    GameObjectType[GameObjectType["ITEM"] = 1] = "ITEM";
    GameObjectType[GameObjectType["CONVEYOR"] = 2] = "CONVEYOR";
    GameObjectType[GameObjectType["DUMMY"] = 3] = "DUMMY";
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
export function getPosition(gameObject) {
    return gameObject.position;
}
export function setMovementVector(gameObject, movementVector) {
    gameObject.movementVector = Object.assign({}, movementVector);
}
export function getMovementVector(gameObject) {
    return gameObject.movementVector;
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
export function moveGameObject(gameObject, moveBy) {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy);
}
