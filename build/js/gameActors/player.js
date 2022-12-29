import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStates, setDefaultState, switchToState, setDesignatedState } from "../state.js";
import { addAnimation, createAnimation, getAnimation } from "../animation.js";
import { createVector, get4DirectionVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { setCollisionBox } from "../collisions.js";
import { createBox } from "../box.js";
import { createGlobalGameObject } from "../gameObjects/gameObjectFactory.js";
const PLAYER_WIDTH = 16, PLAYER_HEIGHT = 16;
export function createPlayer(x, y) {
    const player = createGlobalGameObject(GameObjectType.PLAYER);
    setPosition(player, createVector(x, y));
    setBounds(player, PLAYER_WIDTH, PLAYER_HEIGHT);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
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
        console.log("enter: " + state.name);
        setMovementVector(player, Object.assign({}, NULL_VECTOR));
    };
    state.update = () => {
        if (isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.MOVING));
            return;
        }
    };
    state.exit = () => { };
    return state;
}
function createPlayerMovingState(player) {
    let movingSpeed = 100;
    const state = createEmptyState();
    state.name = "player moving state";
    state.enter = () => { };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updatePlayerCurrentMovingAnimationBasedOnViewVector(player, getViewVector(player));
    };
    state.exit = () => { };
    return state;
}
function addPlayerAnimations(player) {
    player.animations = new Map();
    addPlayerMovingAnimations(player);
}
function addPlayerMovingAnimations(player) {
    addAnimation(player, createAnimation("PlayerMovingUp", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingLeft", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingDown", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingRight", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    setCurrentAnimation(player, getAnimation(player, "PlayerMovingDown"));
}
function updatePlayerCurrentMovingAnimationBasedOnViewVector(player, viewVector) {
    let currentAnimation = getCurrentAnimation(player);
    const currentPosition = currentAnimation.position;
    if (viewVector.x === 1)
        currentAnimation = getAnimation(player, "PlayerMovingRight");
    if (viewVector.x === -1)
        currentAnimation = getAnimation(player, "PlayerMovingLeft");
    if (viewVector.y === -1)
        currentAnimation = getAnimation(player, "PlayerMovingUp");
    if (viewVector.y === 1)
        currentAnimation = getAnimation(player, "PlayerMovingDown");
    setCurrentAnimation(player, currentAnimation);
    currentAnimation.position = Object.assign({}, currentPosition);
}
function addPlayerMovement(player) {
    registerGameObjectForKeyBoardInput(player);
}
function addPlayerCollisionBox(player) {
}
