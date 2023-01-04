import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyPressed, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, switchToState, setDesignatedState, getCurrentState } from "../state.js";
import { addAnimation, createAnimation, getAnimation } from "../animation.js";
import { createVector, get4DirectionVector, normalizedVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { setCollisionBox } from "../collisions.js";
import { createBox } from "../box.js";
import { createGlobalGameObject } from "../gameObjects/gameObjectFactory.js";
import { removeHitBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, enableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
const PLAYER_WIDTH = 16, PLAYER_HEIGHT = 16;
let player;
export function createPlayer(x, y) {
    player = createGlobalGameObject(GameObjectType.PLAYER);
    setPosition(player, createVector(x, y));
    setBounds(player, PLAYER_WIDTH, PLAYER_HEIGHT);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
    setHurtBoxFromBoundingBox(player);
    setPlayerHealth(8);
    setPlayerMaxHealth(8);
    switchToState(player, getState(player, CommonStateTypes.IDLE));
    return player;
}
function setPlayerHealth(health) {
    player.health = health;
}
function setPlayerMaxHealth(maxHealth) {
    player.maxHealth = maxHealth;
}
function addPlayerStates(player) {
    const idleState = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    addState(player, CommonStateTypes.ACTION, createPlayerActionState(player));
    addState(player, CommonStateTypes.HIT, createPlayerHitState(player));
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
        if (isKeyPressed(KEYS.ACTION)) {
            setDesignatedState(player, getState(player, CommonStateTypes.ACTION));
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
        if (isKeyPressed(KEYS.ACTION)) {
            setDesignatedState(player, getState(player, CommonStateTypes.ACTION));
            return;
        }
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
function createPlayerActionState(player) {
    let startTime, duration = 50;
    let hitBox;
    const state = createEmptyState();
    state.type = CommonStateTypes.ACTION;
    state.name = "player action state";
    state.enter = () => {
        startTime = -1;
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, Object.assign({}, NULL_VECTOR));
        hitBox = spawnHitBoxInFrontOf(player, 1);
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (startTime === -1) {
            startTime = currentGameTime;
        }
        if ((currentGameTime - startTime) >= duration) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
    };
    state.exit = () => {
        removeHitBox(hitBox.id);
    };
    return state;
}
function createPlayerHitState(player) {
    let hitBox;
    let startTime = -1;
    let knockBackAngle, knockBackDurationInMs, knockBackVector;
    const state = createEmptyState();
    state.type = CommonStateTypes.HIT;
    state.name = "player hit state";
    state.enter = () => {
        console.log("enter player hit state");
        hitBox = player.stateArgs[0];
        if (player.health)
            player.health -= hitBox.damage;
        if (player.hurtBox)
            disableHurtBox(player.hurtBox);
        knockBackAngle = 90;
        knockBackDurationInMs = 50;
        knockBackVector =
            vectorScalarProduct(200, normalizedVector(createVector(player.position.x - hitBox.position.x, player.position.y - hitBox.position.y)));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (startTime === -1) {
            startTime = currentGameTime;
        }
        if ((currentGameTime - startTime) >= knockBackDurationInMs) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            //return GameObjectModule.isDead(player) ? player.getState(PLAYER_STATES.DEATH) : player.getState(PLAYER_STATES.IDLE);
        }
        setMovementVector(player, knockBackVector);
    };
    state.exit = () => {
        startTime = -1;
        if (player.hurtBox)
            enableHurtBox(player.hurtBox);
        console.log("exit hit state");
    };
    return state;
}
function addPlayerAnimations(player) {
    addPlayerIdleAnimations(player);
    addPlayerMovingAnimations(player);
    addPlayerAttackingAnimations(player);
}
function addPlayerIdleAnimations(player) {
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }], 1, false));
}
function addPlayerMovingAnimations(player) {
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
}
function addPlayerAttackingAnimations(player) {
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 60, srcY: 84 }], 1, false, createVector(0, -11)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 24, srcY: 90 }], 1, false, createVector(-11, 0)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 0, srcY: 84 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 85, srcY: 90 }], 1, false));
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
export function isPlayerDead() {
    return getPlayerHealth() <= 0;
}
export function getPlayerHealth() {
    return player.health || 0;
}
