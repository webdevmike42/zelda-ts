import { createPlayer, Player } from "./gameActors/player.js";
import { GameObject, GameObjectType } from "./gameObjects/gameObject";
import { createTestGameObject } from "./gameObjects/gameObjectFactory.js";

export interface State {
    name: string,
    enter: Function,
    update: Function,
    exit: Function
}

export enum CommonStates {
    IDLE = "idle",
    MOVING = "moving",
    ACTION = "action"
}

export const NULL_STATE: State = Object.freeze({
    name: "NULL_STATE",
    enter: () => { console.log("enter null state") },
    update: () => { },
    exit: () => { console.log("exit null state") }
});

export function createEmptyState(): State {
    return { ...NULL_STATE };
}

export function switchToState(gameObject: GameObject, newStateKey: CommonStates) {
    exitCurrentState(gameObject);
    setCurrentState(gameObject, getState(gameObject, newStateKey));
    enterCurrentState(gameObject);
    //handleGameObjectInput(gameObject);//otherwise, on transition from idle to moving state, very short input will be ignored
}

export function addState(gameObject: GameObject, key: string, newState: State, isCurrentState?: boolean, isDefaultState?: boolean): void {
    gameObject.states.set(key, newState);
    if (isCurrentState) setCurrentState(gameObject, newState);
    if (isDefaultState) setDefaultState(gameObject, newState);
}

export function getState(gameObject: GameObject, key: string): State {
    return gameObject.states.get(key) || gameObject.defaultState;
}

export function setCurrentState(gameObject: GameObject, newState: State): void {
    gameObject.currentState = newState;
}

export function setDefaultState(gameObject: GameObject, newState: State): void {
    gameObject.defaultState = newState;
}

function enterCurrentState(gameObject: GameObject): void {
    gameObject.currentState.enter();
}

function exitCurrentState(gameObject: GameObject): void {
    gameObject.currentState.exit();
}

export function testState() {
    const dummy: GameObject = createTestGameObject();
    console.log(dummy.currentState.name);
    switchToState(dummy,CommonStates.MOVING);
    console.log(dummy.currentState.name);
    switchToState(dummy, CommonStates.ACTION);
    console.log(dummy.currentState.name);
}