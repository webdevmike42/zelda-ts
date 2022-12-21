import { addGameObject } from "../gameObjects/gameObjectFactory.js";
import { createMovementVector, GameObjectType, getPosition, setCurrentAnimation, setMovementVector, setPosition } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStates, setDefaultState, switchToState, setDesignatedState } from "../state.js";
import { createAnimation } from "../animation.js";
import { createVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
export function createPlayer(x, y) {
    const player = addGameObject(GameObjectType.PLAYER);
    setPosition(player, createVector(x, y));
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    switchToState(player, getState(player, CommonStates.IDLE));
    return player;
}
function addPlayerStates(player) {
    const idleState = createPlayerIdleState(player);
    addState(player, CommonStates.IDLE, idleState);
    addState(player, CommonStates.MOVING, createPlayerMovingState(player));
    setDefaultState(player, idleState);
}
function createPlayerIdleState(player) {
    const state = createEmptyState();
    state.name = "player idle state";
    state.enter = () => {
        console.log("enter " + state.name);
        setMovementVector(player, Object.assign({}, NULL_VECTOR));
    };
    state.update = () => {
        if (isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.MOVING));
            return;
        }
    };
    state.exit = () => console.log("exit " + state.name);
    return state;
}
function createPlayerMovingState(player) {
    let movingSpeed = 100;
    const state = createEmptyState();
    state.name = "player moving state";
    state.enter = () => console.log("enter " + state.name);
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.IDLE));
            return;
        }
        setMovementVector(player, vectorScalarProduct(movingSpeed, createMovementVector()));
    };
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
