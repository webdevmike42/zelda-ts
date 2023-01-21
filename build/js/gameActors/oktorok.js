import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, removeHitBox, setHitBoxFromBoundingBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, getCurrentState } from "../state.js";
import { createVector, get4DirectionVector, NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isGameObjectDead, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { createGameObject } from "../gameObjects/gameObjectFactory.js";
import { isAnyMovementKeyDown, isKeyDown, KEYS } from "../KeyboardInputHandler.js";
const OKTOROK_WIDTH = 16, OKTOROK_HEIGHT = 16, OKTOROK_HEALTH = 1, OKTOROK_DAMAGE = 1;
export function createRedOktorok(x, y) {
    const oktorok = createGameObject(GameObjectType.OKTOROK);
    oktorok.name = "oktorok";
    setPosition(oktorok, createVector(x, y));
    setBounds(oktorok, OKTOROK_WIDTH, OKTOROK_HEIGHT);
    setCollisionBoxFromBoundingBox(oktorok);
    setHitBoxFromBoundingBox(oktorok, OKTOROK_DAMAGE);
    setHurtBoxFromBoundingBox(oktorok);
    setHealth(oktorok, OKTOROK_HEALTH);
    setMaxHealth(oktorok, OKTOROK_HEALTH);
    addRedOktorokAnimations(oktorok);
    addOktorokStates(oktorok);
    proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.IDLE));
    return oktorok;
}
function addOktorokStates(oktorok) {
    const idleState = createOktorokIdleState(oktorok);
    addState(oktorok, CommonStateTypes.IDLE, idleState);
    addState(oktorok, CommonStateTypes.MOVING, createOktorokMovingState(oktorok));
    addState(oktorok, CommonStateTypes.HIT, createOktorokHitState(oktorok));
    addState(oktorok, CommonStateTypes.DEATH, createOktorokDeathState(oktorok));
    addState(oktorok, CommonStateTypes.ACTION, createOktorokActionState(oktorok));
    setDefaultState(oktorok, idleState);
}
function createOktorokIdleState(oktorok) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "oktorok idle state";
    state.enter = () => {
        console.log("entered" + state.name);
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, Object.assign({}, NULL_VECTOR));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.MOVING));
            return;
        }
        if (isKeyDown(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
    };
    state.exit = () => { };
    return state;
}
function createOktorokMovingState(oktorok) {
    let movingSpeed = 100;
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (isKeyDown(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
        if (!isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(oktorok, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(oktorok, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(oktorok);
    };
    return state;
}
function createOktorokHitState(oktorok) {
    const state = createEmptyState(CommonStateTypes.HIT);
    let hitBox;
    state.name = "oktorok hit state";
    state.init = (hitBoxArg) => {
        hitBox = hitBoxArg;
    };
    state.enter = () => {
        if (oktorok.health) {
            oktorok.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(oktorok)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.DEATH));
        }
    };
    return state;
}
function createOktorokDeathState(oktorok) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "oktorok death state";
    state.enter = () => {
        console.log("enter redOktorok death");
        disableHurtBox(oktorok);
        disableHitBox(oktorok);
    };
    return state;
}
function createOktorokActionState(oktorok) {
    let durationInMS = 50;
    let hitBox;
    const state = createEmptyState(CommonStateTypes.ACTION);
    state.name = "oktorok action state";
    state.enter = () => {
        console.log("enter " + state.name);
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, Object.assign({}, NULL_VECTOR));
        hitBox = spawnHitBoxInFrontOf(oktorok, 1);
        setTimeout(proposeDesignatedState, durationInMS, oktorok, getState(oktorok, CommonStateTypes.IDLE));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
    };
    state.exit = () => {
        removeHitBox(hitBox.id);
    };
    return state;
}
function addRedOktorokAnimations(oktorok) {
    addOktorokIdleAnimations(oktorok);
    addOktorokMovingAnimations(oktorok);
    addOktorokActionAnimations(oktorok);
}
function addOktorokIdleAnimations(oktorok) {
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 }], 1, false));
}
function addOktorokMovingAnimations(oktorok) {
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 }, { srcX: 60, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 }, { srcX: 90, srcY: 30 }], 6, true));
}
function addOktorokActionAnimations(oktorok) {
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 30 }], 1, false));
}
function updateCurrentAnimationBasedOnViewVector(oktorok) {
    let currentAnimation = getCurrentAnimation(oktorok);
    const currentPosition = currentAnimation.position;
    currentAnimation = getAnimation(oktorok, getCurrentState(oktorok).type + getDirectionNameFromViewVector(getViewVector(oktorok)));
    setCurrentAnimation(oktorok, currentAnimation);
    currentAnimation.position = Object.assign({}, currentPosition);
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
