import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "./player.js";
import { disableHitBox, enableHitBox, HitBox, removeHitBox, setHitBoxFromBoundingBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, isHurtBoxEnabled, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, getCurrentState } from "../state.js";
import { createRandom4DirectionViewVector, createVector, get4DirectionVector, NULL_VECTOR, reverseVector, Vector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getMovementVector, getOverallVector, getPosition, getViewVector, isCoolingDown, isGameObjectDead, setAIControlled, setBounds, setHealth, setMaxHealth, setMovementVector, setPlayerControlled, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { addToCurrentGameObjects, createGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { getMappedInput, isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS, pressAndHoldKey, pressAndHoldRandomMovementKey, pressKey, registerGameObjectForKeyBoardInput, releaseAllKeys, releaseKey, reverseMovementInput } from "../KeyboardInputHandler.js";
import { Item } from "../gameObjects/item.js";
import { Box, createBox, createBoxInFront } from "../box.js";
import { Bullet, createBullet } from "../gameObjects/bullet.js";
import { getRandomInt } from "../utils.js";

const STALFOS_WIDTH = 16, STALFOS_HEIGHT = 16, STALFOS_HEALTH = 1, STALFOS_DAMAGE = 1, STALFOS_MOVING_SPEED = 40;

export function createStalfos(x: number, y: number): GameObject {
    const stalfos: GameObject = createGameObject(GameObjectType.STALFOS);
    stalfos.name = "stalfos"
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

function initStalfosAI(stalfos: GameObject): void {
    stalfos.ai_TimeRangeToNextAction[0] = 200;
    stalfos.ai_TimeRangeToNextAction[1] = 500;
    stalfos.ai_NextAction = (stalfos: GameObject) => {
        releaseAllKeys(getMappedInput(stalfos));
        pressAndHoldRandomMovementKey(getMappedInput(stalfos));
        setTimeout(stalfos.ai_NextAction, getRandomInt(stalfos.ai_TimeRangeToNextAction[0], stalfos.ai_TimeRangeToNextAction[1]), stalfos)
    }

    stalfos.ai_update = (stalfos: GameObject) => {
        if (stalfos.hitSolid) {
            reverseMovementInput(getMappedInput(stalfos));
        }
    }

    stalfos.ai_NextAction(stalfos);
}

function addStalfosStates(stalfos: GameObject): void {
    const idleState: State = createStalfosIdleState(stalfos);
    const movingState: State = createStalfosMovingState(stalfos);
    addState(stalfos, CommonStateTypes.IDLE, idleState);
    addState(stalfos, CommonStateTypes.MOVING, movingState);
    addState(stalfos, CommonStateTypes.HIT, createStalfosHitState(stalfos));
    addState(stalfos, CommonStateTypes.DEATH, createStalfosDeathState(stalfos));
    setDefaultState(stalfos, idleState);
}

function createStalfosIdleState(stalfos: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "stalfos idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(stalfos);
        setMovementVector(stalfos, { ...NULL_VECTOR });
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (isAnyMovementKeyDown(getMappedInput(stalfos))) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.MOVING));
            return;
        }
    }
    return state;
}

function createStalfosMovingState(stalfos: GameObject): State {
    const state = createEmptyState(CommonStateTypes.MOVING);
       
    state.enter = () => {
        setMovementVector(stalfos, vectorScalarProduct(STALFOS_MOVING_SPEED, getViewVector(stalfos)));
    }

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
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
    }
    return state;
}

function createStalfosHitState(stalfos: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "stalfos hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.enter = () => {
        if (stalfos.health) {
            stalfos.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(stalfos)) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.DEATH));
        }
    }
    return state;
}

function createStalfosDeathState(stalfos: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "stalfos death state";

    state.enter = () => {
        console.log("enter stalfos death")
        setMovementVector(stalfos, { ...NULL_VECTOR });
        disableHurtBox(stalfos);
        disableHitBox(stalfos);
        setTimeout(setVisible, 2000, stalfos, false);
    };
    return state;
}

function addStalfosAnimations(stalfos: GameObject): void {
    addStalfosIdleAnimations(stalfos);
    addStalfosMovingAnimations(stalfos);
}

function addStalfosIdleAnimations(stalfos: GameObject): void {
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
}

function addStalfosMovingAnimations(stalfos: GameObject): void {
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 6, true));
}

function updateCurrentAnimationBasedOnViewVector(stalfos: GameObject): void {
    let currentAnimation = getCurrentAnimation(stalfos);
    const currentPosition = currentAnimation.position;

    currentAnimation = getAnimation(stalfos, getCurrentState(stalfos).type + getDirectionNameFromViewVector(getViewVector(stalfos)));

    setCurrentAnimation(stalfos, currentAnimation);
    currentAnimation.position = { ...currentPosition };
}

function getDirectionNameFromViewVector(viewVector: Vector): string {
    if (viewVector.x === 1) return "Right";
    if (viewVector.x === -1) return "Left";
    if (viewVector.y === -1) return "Up";
    return "Down";
}