import { Animation, NULL_ANIMATION } from "../animation.js";
import { State } from "../state.js";
import { Vector, vectorSum } from "../vector.js";

export interface GameObject {
    id: number;
    type: GameObjectType;
    states: Map<string, State>;
    currentState: State;
    defaultState: State;
    position: Vector;
    animations?: Map<string, Animation>;
    currentAnimation?: Animation,
    defaultAnimation?: Animation,
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

export function moveGameObject(gameObject: GameObject, moveBy: Vector): void {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy)

}