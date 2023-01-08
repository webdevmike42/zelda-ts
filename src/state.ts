import { GameObject } from "./gameObjects/gameObject.js";

export interface State {
    type: string,
    name: string,
    enter: Function,
    update: Function,
    exit: Function
}

export enum CommonStateTypes {
    NULL = "Null",
    IDLE = "Idle",
    MOVING = "Moving",
    ACTION = "Action",
    HIT = "Hit",
    DEATH = "Death"
}

export const NULL_STATE: State = Object.freeze({
    type: CommonStateTypes.NULL,
    name: "NULL_STATE",
    enter: () => { console.log("enter null state") },
    update: () => { },
    exit: () => { console.log("exit null state") }
});

export function createEmptyState(): State {
    return { ...NULL_STATE };
}

export function switchToState(gameObject: GameObject, newState: State) {
    exitCurrentState(gameObject);
    setCurrentState(gameObject, newState);
    enterCurrentState(gameObject);
    //handleGameObjectInput(gameObject);//otherwise, on transition from idle to moving state, very short input will be ignored
}

export function addState(gameObject: GameObject, key: string, newState: State): void {
    gameObject.states.set(key, newState);
}

export function getState(gameObject: GameObject, key: string): State {
    return gameObject.states.get(key) || gameObject.defaultState || { ...NULL_STATE };
}

export function setCurrentState(gameObject: GameObject, newState: State): void {
    gameObject.currentState = newState;
}

export function getCurrentState(gameObject: GameObject): State {
    return gameObject.currentState;
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

export function setDesignatedState(gameObject: GameObject, designatedState: State | null, designatedStateArgs?: any[]): void {
    gameObject.designatedState = designatedState;
    gameObject.stateArgs = designatedStateArgs || [];
}

export function testState() {
    /*
    const dummy: GameObject = createTestGameObject();
    console.log(dummy.currentState.name);
    switchToState(dummy, getState(dummy, CommonStates.MOVING));
    console.log(dummy.currentState.name);
    switchToState(dummy, getState(dummy, CommonStates.ACTION));
    console.log(dummy.currentState.name);
    */
}