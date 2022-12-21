import { Animation, NULL_ANIMATION } from "../animation.js";
import { isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { State } from "../state.js";
import { createVector, NULL_VECTOR, Vector, vectorSum } from "../vector.js";

export interface GameObject {
    id: number;
    type: GameObjectType;
    states: Map<string, State>;
    currentState: State;
    defaultState: State;
    designatedState: State | null;
    position: Vector;
    animations?: Map<string, Animation>;
    currentAnimation?: Animation,
    defaultAnimation?: Animation,
    viewVector: Vector,
    movementVector: Vector,
    isSolid?: boolean;
    internalId?: number;
}

export enum GameObjectType {
    PLAYER,
    ITEM,
    CONVEYOR,
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

export function createMovementVector(): Vector {
    let movementVector: Vector = { ...NULL_VECTOR };
    if (isKeyDown(KEYS.UP)) movementVector = vectorSum(movementVector, createVector(0, -1))
    if (isKeyDown(KEYS.LEFT)) movementVector = vectorSum(movementVector, createVector(-1, 0))
    if (isKeyDown(KEYS.DOWN)) movementVector = vectorSum(movementVector, createVector(0, 1))
    if (isKeyDown(KEYS.RIGHT)) movementVector = vectorSum(movementVector, createVector(1, 0))
    return movementVector;
}

export function moveGameObject(gameObject: GameObject, moveBy: Vector): void {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy)

}