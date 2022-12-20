import { addGameObject } from "../gameObjects/gameObjectFactory.js";
import { GameObject, GameObjectType, getCurrentAnimation, getPosition, setCurrentAnimation, setPosition } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStates, setDefaultState, State, setCurrentState } from "../state.js";
import { createAnimation } from "../animation.js";
import { createVector } from "../vector.js";

export interface Player extends GameObject {
    test: boolean
}

export function createPlayer(x: number, y: number): Player {
    const player: Player = addGameObject(GameObjectType.PLAYER) as Player;
    setPosition(player,createVector(x,y));
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    return player;
}

function addPlayerStates(player: Player): void {
    addState(player, CommonStates.IDLE, createPlayerIdleState(player), true, true);
    addState(player, CommonStates.MOVING, createPlayerMovingState(player));
}

function createPlayerIdleState(player: Player): State {
    const state: State = createEmptyState();
    state.name = "player idle state";
    state.enter = () => console.log("enter " + state.name);
    state.update = () => console.log("update " + state.name);
    state.exit = () => console.log("exit " + state.name);
    return state;
}

function createPlayerMovingState(player: Player): State {
    const state: State = createEmptyState();
    state.name = "player moving state";
    state.enter = () => console.log("enter " + state.name);
    state.update = () => console.log("update " + state.name);
    state.exit = () => console.log("exit " + state.name);
    return state;
}

function addPlayerAnimations(player: Player): void {
    addPlayerMovingAnimations(player);
}

function addPlayerMovingAnimations(player: Player): void {
    const curAnimation = createAnimation("PlayerMoving", "./resources/link.png",getPosition(player), 16, 16, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true);

    player.animations?.set("PlayerMoving", curAnimation);
    setCurrentAnimation(player, curAnimation);
}

function addPlayerMovement(player: Player): void {

    registerGameObjectForKeyBoardInput(player)
}

export function handlePlayerMovementInput(player: Player): void {
    if (isAnyMovementKeyDown())
        console.log("player moving");
    else
        console.log("player is standing");
}