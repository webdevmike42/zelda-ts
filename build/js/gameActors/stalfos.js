import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, getCurrentState } from "../state.js";
import { createVector, get4DirectionVector, NULL_VECTOR, reverseVector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isGameObjectDead, setAIControlled, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector, setVisible } from "../gameObjects/gameObject.js";
import { createGameObject } from "../gameObjects/gameObjectFactory.js";
import { getMappedInput, isAnyMovementKeyDown, pressAndHoldRandomMovementKey, releaseAllKeys, reverseMovementInput } from "../KeyboardInputHandler.js";
import { createBox } from "../box.js";
import { getRandomInt } from "../utils.js";
const STALFOS_WIDTH = 16, STALFOS_HEIGHT = 16, STALFOS_HEALTH = 1, STALFOS_DAMAGE = 1, STALFOS_MOVING_SPEED = 40;
export function createStalfos(x, y) {
    const stalfos = createGameObject(GameObjectType.STALFOS);
    stalfos.name = "stalfos";
    setPosition(stalfos, createVector(x, y));
    setBounds(stalfos, STALFOS_WIDTH, STALFOS_HEIGHT);
    setCollisionBox(stalfos, createBox(getPosition(stalfos).x + 2, getPosition(stalfos).y + Math.floor(stalfos.height / 2), stalfos.width - 4, Math.floor(stalfos.height / 2)));
    setHitBoxFromBoundingBox(stalfos, STALFOS_DAMAGE);
    setHurtBoxFromBoundingBox(stalfos);
    setHealth(stalfos, STALFOS_HEALTH);
    setMaxHealth(stalfos, STALFOS_HEALTH);
    addStalfosAnimations(stalfos);
    addStalfosStates(stalfos);
    //setPlayerControlled(stalfos);
    //registerGameObjectForKeyBoardInput(stalfos);
    setAIControlled(stalfos);
    initStalfosAI(stalfos);
    proposeDesignatedState(stalfos, stalfos.defaultState);
    return stalfos;
}
function initStalfosAI(stalfos) {
    stalfos.ai_TimeRangeToNextAction[0] = 200;
    stalfos.ai_TimeRangeToNextAction[1] = 500;
    stalfos.ai_NextAction = (stalfos) => {
        releaseAllKeys(getMappedInput(stalfos));
        pressAndHoldRandomMovementKey(getMappedInput(stalfos));
        setTimeout(stalfos.ai_NextAction, getRandomInt(stalfos.ai_TimeRangeToNextAction[0], stalfos.ai_TimeRangeToNextAction[1]), stalfos);
    };
    stalfos.ai_update = (stalfos) => {
        if (stalfos.hitSolid) {
            reverseMovementInput(getMappedInput(stalfos));
        }
    };
    stalfos.ai_NextAction(stalfos);
}
function addStalfosStates(stalfos) {
    const idleState = createStalfosIdleState(stalfos);
    const movingState = createStalfosMovingState(stalfos);
    addState(stalfos, CommonStateTypes.IDLE, idleState);
    addState(stalfos, CommonStateTypes.MOVING, movingState);
    addState(stalfos, CommonStateTypes.HIT, createStalfosHitState(stalfos));
    addState(stalfos, CommonStateTypes.DEATH, createStalfosDeathState(stalfos));
    setDefaultState(stalfos, idleState);
}
function createStalfosIdleState(stalfos) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "stalfos idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(stalfos);
        setMovementVector(stalfos, Object.assign({}, NULL_VECTOR));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (isAnyMovementKeyDown(getMappedInput(stalfos))) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.MOVING));
            return;
        }
    };
    return state;
}
function createStalfosMovingState(stalfos) {
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.enter = () => {
        setMovementVector(stalfos, vectorScalarProduct(STALFOS_MOVING_SPEED, getViewVector(stalfos)));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isAnyMovementKeyDown(getMappedInput(stalfos))) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.IDLE));
            return;
        }
        if (stalfos.hitSolid /*&& ! isCoolingDown(stalfos)*/) {
            //console.log("reversed direction")
            //startCoolDown(stalfos,() => {},() =>{},1000);
            //stalfos.hitSolid = false;
            //setMovementVector(stalfos, reverseVector(getMovementVector(stalfos)))
            setViewVector(stalfos, reverseVector(getViewVector(stalfos)));
        }
        //else
        const movementVector = createMovementVector(getMappedInput(stalfos));
        setMovementVector(stalfos, vectorScalarProduct(STALFOS_MOVING_SPEED, movementVector));
        setViewVector(stalfos, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(stalfos);
    };
    return state;
}
function createStalfosHitState(stalfos) {
    const state = createEmptyState(CommonStateTypes.HIT);
    let hitBox;
    state.name = "stalfos hit state";
    state.init = (hitBoxArg) => {
        hitBox = hitBoxArg;
    };
    state.enter = () => {
        if (stalfos.health) {
            stalfos.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(stalfos)) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.DEATH));
        }
    };
    return state;
}
function createStalfosDeathState(stalfos) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "stalfos death state";
    state.enter = () => {
        console.log("enter stalfos death");
        setMovementVector(stalfos, Object.assign({}, NULL_VECTOR));
        disableHurtBox(stalfos);
        disableHitBox(stalfos);
        setTimeout(setVisible, 2000, stalfos, false);
    };
    return state;
}
function addStalfosAnimations(stalfos) {
    addStalfosIdleAnimations(stalfos);
    addStalfosMovingAnimations(stalfos);
}
function addStalfosIdleAnimations(stalfos) {
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
}
function addStalfosMovingAnimations(stalfos) {
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
}
function updateCurrentAnimationBasedOnViewVector(stalfos) {
    let currentAnimation = getCurrentAnimation(stalfos);
    const currentPosition = currentAnimation.position;
    currentAnimation = getAnimation(stalfos, getCurrentState(stalfos).type + getDirectionNameFromViewVector(getViewVector(stalfos)));
    setCurrentAnimation(stalfos, currentAnimation);
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
