import { Animation, NULL_ANIMATION } from "../animation.js";
import { Box, createBox } from "../box.js";
import { setCollisionBoxFromBoundingBox, setCollisionBox, getCollidingSolidGameObjects, getProspectedCollisionBox, getCollisionBox } from "../collisions.js";
import { HitBox } from "../hitbox.js";
import { HurtBox } from "../hurtbox.js";
import { isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { State } from "../state.js";
import { createVector, NULL_VECTOR, Vector, vectorDiff, vectorSum } from "../vector.js";
import { getGameObjects } from "./gameObjectFactory.js";

export interface GameObject {
    id: number;
    type: GameObjectType;
    states: Map<string, State>;
    currentState: State;
    defaultState: State;
    designatedState: State | null;
    position: Vector;
    width: number,
    height: number,
    collisionBox: Box;
    animations?: Map<string, Animation>;
    currentAnimation?: Animation,
    defaultAnimation?: Animation,
    viewVector: Vector,
    movementVector: Vector,
    isSolid?: boolean;
    internalId?: number;
    hitBox?: HitBox;
    hurtBox?: HurtBox;
}

export enum GameObjectType {
    PLAYER,
    ITEM,
    CONVEYOR,
    TELEPORTER,
    HAZARD,
    DUMMY
}

export function getCurrentAnimation(gameObject: GameObject): Animation {
    return gameObject.currentAnimation || gameObject.defaultAnimation || { ...NULL_ANIMATION };
}

export function setCurrentAnimation(gameObject: GameObject, animation: Animation): void {
    gameObject.currentAnimation = animation;
}

export function setPosition(gameObject: GameObject, newPosition: Vector): void {
    gameObject.position = { ...newPosition };
}

export function setBounds(gameObject: GameObject, width: number, height: number): void {
    gameObject.width = width;
    gameObject.height = height;
}

export function getBoundingBox(gameObject: GameObject): Box {
    return createBox(gameObject.position.x, gameObject.position.y, gameObject.width, gameObject.height);
}

export function getPosition(gameObject: GameObject): Vector {
    return gameObject.position;
}

export function setMovementVector(gameObject: GameObject, movementVector: Vector): void {
    gameObject.movementVector = { ...movementVector };
}

export function getMovementVector(gameObject: GameObject): Vector {
    return gameObject.movementVector;
}

export function setViewVector(gameObject: GameObject, viewVector: Vector): void {
    gameObject.viewVector = { ...viewVector };
}

export function getViewVector(gameObject: GameObject): Vector {
    return gameObject.viewVector;
}

export function getCenter(gameObject: GameObject): Vector {
    const position = getPosition(gameObject);
    return createVector(position.x + Math.floor(gameObject.width / 2), position.y + Math.floor(gameObject.height / 2));
}

export function createMovementVector(): Vector {
    let movementVector: Vector = { ...NULL_VECTOR };
    if (isKeyDown(KEYS.UP)) movementVector = vectorSum(movementVector, createVector(0, -1))
    if (isKeyDown(KEYS.LEFT)) movementVector = vectorSum(movementVector, createVector(-1, 0))
    if (isKeyDown(KEYS.DOWN)) movementVector = vectorSum(movementVector, createVector(0, 1))
    if (isKeyDown(KEYS.RIGHT)) movementVector = vectorSum(movementVector, createVector(1, 0))
    return movementVector;
}

export function isMoving(movementVector: Vector): boolean {
    return movementVector.x !== 0 || movementVector.y !== 0;
}

export function moveGameObject(gameObject: GameObject, moveBy: Vector): void {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy);
    if (gameObject.hitBox)
        gameObject.hitBox.position = vectorSum(gameObject.hitBox.position, moveBy);
    if (gameObject.hurtBox)
        gameObject.hurtBox.position = vectorSum(gameObject.hurtBox.position, moveBy);
    gameObject.collisionBox.position = vectorSum(gameObject.collisionBox.position, moveBy);
}

export function setGameObjectPosition(gameObject: GameObject, newPosition: Vector): void {
    const diffVector = vectorDiff(newPosition, getPosition(gameObject));
    if (getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), getGameObjects()).length === 0) {
        moveGameObject(gameObject, diffVector);
    }
}