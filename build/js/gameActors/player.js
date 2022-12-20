import { addGameObject } from "../gameObjects/gameObjectFactory.js";
import { GameObjectType, getPosition, setCurrentAnimation, setPosition } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, CommonStates } from "../state.js";
import { createAnimation } from "../animation.js";
import { createVector } from "../vector.js";
export function createPlayer(x, y) {
    const player = addGameObject(GameObjectType.PLAYER);
    setPosition(player, createVector(x, y));
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    return player;
}
function addPlayerStates(player) {
    addState(player, CommonStates.IDLE, createPlayerIdleState(player), true, true);
    addState(player, CommonStates.MOVING, createPlayerMovingState(player));
}
function createPlayerIdleState(player) {
    const state = createEmptyState();
    state.name = "player idle state";
    state.enter = () => console.log("enter " + state.name);
    state.update = () => console.log("update " + state.name);
    state.exit = () => console.log("exit " + state.name);
    return state;
}
function createPlayerMovingState(player) {
    const state = createEmptyState();
    state.name = "player moving state";
    state.enter = () => console.log("enter " + state.name);
    state.update = () => console.log("update " + state.name);
    state.exit = () => console.log("exit " + state.name);
    return state;
}
function addPlayerAnimations(player) {
    addPlayerMovingAnimations(player);
}
function addPlayerMovingAnimations(player) {
    var _a;
    const curAnimation = createAnimation("PlayerMoving", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true);
    (_a = player.animations) === null || _a === void 0 ? void 0 : _a.set("PlayerMoving", curAnimation);
    setCurrentAnimation(player, curAnimation);
}
function addPlayerMovement(player) {
    registerGameObjectForKeyBoardInput(player);
}
export function handlePlayerMovementInput(player) {
    if (isAnyMovementKeyDown())
        console.log("player moving");
    else
        console.log("player is standing");
}
