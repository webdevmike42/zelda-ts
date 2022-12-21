import { addGameObject } from "../gameObjects/gameObjectFactory.js";
import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getPosition, moveGameObject, setCurrentAnimation, setMovementVector, setPosition } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyDown, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStates, setDefaultState, State, setCurrentState, switchToState, setDesignatedState } from "../state.js";
import { createAnimation } from "../animation.js";
import { createVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { getVectorFrameFraction } from "../utils.js";

export interface Player extends GameObject {
    test: boolean
}

export function createPlayer(x: number, y: number): Player {
    const player: Player = addGameObject(GameObjectType.PLAYER) as Player;
    setPosition(player, createVector(x, y));
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    switchToState(player, getState(player, CommonStates.IDLE));
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStates.IDLE, idleState);
    addState(player, CommonStates.MOVING, createPlayerMovingState(player));
    setDefaultState(player, idleState);
}

function createPlayerIdleState(player: Player): State {
    const state: State = createEmptyState();
    state.name = "player idle state";
    state.enter = () => {
        console.log("enter " + state.name);
        setMovementVector(player, {...NULL_VECTOR});
    }
    state.update = () => {
        if(isAnyMovementKeyDown()){
            setDesignatedState(player, getState(player,CommonStates.MOVING));
            return;
        }
    }
    state.exit = () => console.log("exit " + state.name);
    return state;
}

function createPlayerMovingState(player: Player): State {
    let movingSpeed = 100;
    const state: State = createEmptyState();
    state.name = "player moving state";
    state.enter = () => console.log("enter " + state.name);
    state.update = (currentGameTime:number, timeSinceLastTick:number) => {
        if(!isAnyMovementKeyDown()){
            setDesignatedState(player, getState(player,CommonStates.IDLE));
            return;
        }
        setMovementVector(player, vectorScalarProduct(movingSpeed,createMovementVector()));
    }
    state.exit = () => console.log("exit " + state.name);
    return state;
}

function addPlayerAnimations(player: Player): void {
    addPlayerMovingAnimations(player);
}

function addPlayerMovingAnimations(player: Player): void {
    const curAnimation = createAnimation("PlayerMoving", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true);

    player.animations?.set("PlayerMoving", curAnimation);
    setCurrentAnimation(player, curAnimation);
}

function addPlayerMovement(player: Player): void {
    registerGameObjectForKeyBoardInput(player)
}