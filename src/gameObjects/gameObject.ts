import { Animation, NULL_ANIMATION, updateAnimation } from "../animation.js";
import { State } from "../state.js";

export interface GameObject {
    id: number;
    type: GameObjectType;
    states: Map<string, State>;
    currentState: State;
    defaultState: State;
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