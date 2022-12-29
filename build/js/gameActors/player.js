import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, switchToState, setDesignatedState, getCurrentState } from "../state.js";
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
    switchToState(player, getState(player, CommonStateTypes.IDLE));
    return player;
}
function addPlayerStates(player) {
    const idleState = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    setDefaultState(player, idleState);
}
function createPlayerIdleState(player) {
    const state = createEmptyState();
    state.type = CommonStateTypes.IDLE;
    state.name = "player idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, Object.assign({}, NULL_VECTOR));
    };
    state.update = () => {
        if (isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStateTypes.MOVING));
            return;
        }
    };
    state.exit = () => { };
    return state;
}
function createPlayerMovingState(player) {
    let movingSpeed = 100;
    const state = createEmptyState();
    state.type = CommonStateTypes.MOVING;
    state.name = "player moving state";
    state.enter = () => { };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);
    };
    state.exit = () => { };
    return state;
}
function addPlayerAnimations(player) {
    player.animations = new Map();
    addPlayerIdleAnimations(player);
    addPlayerMovingAnimations(player);
}
function addPlayerIdleAnimations(player) {
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }], 1, false));
    setCurrentAnimation(player, getAnimation(player, CommonStateTypes.IDLE + "Down"));
}
function addPlayerMovingAnimations(player) {
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    setCurrentAnimation(player, getAnimation(player, CommonStateTypes.MOVING + "Down"));
}
function updateCurrentAnimationBasedOnViewVector(player) {
    let currentAnimation = getCurrentAnimation(player);
    const currentPosition = currentAnimation.position;
    currentAnimation = getAnimation(player, getCurrentState(player).type + getDirectionNameFromViewVector(getViewVector(player)));
    setCurrentAnimation(player, currentAnimation);
    currentAnimation.position = Object.assign({}, currentPosition);
}
function addPlayerMovement(player) {
    registerGameObjectForKeyBoardInput(player);
}
function getDirectionNameFromViewVector(viewVector) {
    if (viewVector.x === 1)
        return "Right";
    if (viewVector.x === -1)
        return "Left";
    if (viewVector.y === -1)
        return "Up";
    return "Down";
}
