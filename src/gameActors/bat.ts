import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "./player.js";
import { disableHitBox, enableHitBox, HitBox, setHitBoxFromBoundingBox, spawnHitBoxInFrontOf } from "../hitbox.js";
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

const REDBAT_WIDTH = 16, REDBAT_HEIGHT = 16, REDBAT_HEALTH = 1, REDBAT_DAMAGE = 1, REDBAT_MOVING_SPEED = 40;

export function createRedbat(x: number, y: number): GameObject {
    const redbat: GameObject = createGameObject(GameObjectType.BAT);
    redbat.name = "redbat"
    setPosition(redbat, createVector(x, y));
    setBounds(redbat, REDBAT_WIDTH, REDBAT_HEIGHT);
    setCollisionBox(redbat, createBox(getPosition(redbat).x + 2, getPosition(redbat).y + Math.floor(redbat.height / 2), redbat.width - 4, Math.floor(redbat.height / 2)));
    
    setHitBoxFromBoundingBox(redbat, REDBAT_DAMAGE);
    setHurtBoxFromBoundingBox(redbat);
    setHealth(redbat, REDBAT_HEALTH);
    setMaxHealth(redbat, REDBAT_HEALTH);
    addRedbatAnimations(redbat);
    addRedbatStates(redbat);

    //setPlayerControlled(redbat);
    //registerGameObjectForKeyBoardInput(redbat);

    setAIControlled(redbat);
    initRedbatAI(redbat);
    
    proposeDesignatedState(redbat, redbat.defaultState);
    return redbat;
}

function initRedbatAI(redbat: GameObject): void {
    redbat.ai_TimeRangeToNextAction[0] = 200;
    redbat.ai_TimeRangeToNextAction[1] = 500;
    redbat.ai_NextAction = (redbat: GameObject) => {
        releaseAllKeys(getMappedInput(redbat));
        pressAndHoldRandomMovementKey(getMappedInput(redbat));
        setTimeout(redbat.ai_NextAction, getRandomInt(redbat.ai_TimeRangeToNextAction[0], redbat.ai_TimeRangeToNextAction[1]), redbat)
    }

    redbat.ai_update = (redbat: GameObject) => {
        if (redbat.hitSolid) {
            reverseMovementInput(getMappedInput(redbat));
        }
    }

    redbat.ai_NextAction(redbat);
}

function addRedbatStates(redbat: GameObject): void {
    const movingState: State = createRedbatMovingState(redbat);
    addState(redbat, CommonStateTypes.MOVING, movingState);
    addState(redbat, CommonStateTypes.HIT, createRedbatHitState(redbat));
    addState(redbat, CommonStateTypes.DEATH, createRedbatDeathState(redbat));
    setDefaultState(redbat, movingState);
}

function createRedbatMovingState(redbat: GameObject): State {
    const state = createEmptyState(CommonStateTypes.MOVING);
       
    state.enter = () => {
        setMovementVector(redbat, vectorScalarProduct(REDBAT_MOVING_SPEED, getViewVector(redbat)));
    }

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (!isAnyMovementKeyDown(getMappedInput(redbat))) {
            proposeDesignatedState(redbat, getState(redbat, CommonStateTypes.IDLE));
            return;
        }


        if (redbat.hitSolid /*&& ! isCoolingDown(redbat)*/) {
            //console.log("reversed direction")
            //startCoolDown(redbat,() => {},() =>{},1000);
            //redbat.hitSolid = false;
            //setMovementVector(redbat, reverseVector(getMovementVector(redbat)))
            setViewVector(redbat, reverseVector(getViewVector(redbat)));
        }
        //else
        const movementVector = createMovementVector(getMappedInput(redbat));
        setMovementVector(redbat, vectorScalarProduct(REDBAT_MOVING_SPEED, movementVector));
        setViewVector(redbat, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(redbat);
    }
    return state;
}

function createRedbatHitState(redbat: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "redbat hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.enter = () => {
        if (redbat.health) {
            redbat.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(redbat)) {
            proposeDesignatedState(redbat, getState(redbat, CommonStateTypes.DEATH));
        }
    }
    return state;
}

function createRedbatDeathState(redbat: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "redbat death state";

    state.enter = () => {
        console.log("enter redbat death")
        setMovementVector(redbat, { ...NULL_VECTOR });
        disableHurtBox(redbat);
        disableHitBox(redbat);
        setTimeout(setVisible, 2000, redbat, false);
    };
    return state;
}

function addRedbatAnimations(redbat: GameObject): void {
    addRedbatMovingAnimations(redbat);
}

function addRedbatMovingAnimations(redbat: GameObject): void {
    addAnimation(redbat, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(redbat), redbat.width, redbat.height, [{ srcX: 280, srcY: 270 }, { srcX: 305, srcY: 270 }], 15, true));
    addAnimation(redbat, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(redbat), redbat.width, redbat.height, [{ srcX: 280, srcY: 270 }, { srcX: 305, srcY: 270 }], 15, true));
    addAnimation(redbat, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(redbat), redbat.width, redbat.height, [{ srcX: 280, srcY: 270 }, { srcX: 305, srcY: 270 }], 15, true));
    addAnimation(redbat, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(redbat), redbat.width, redbat.height, [{ srcX: 280, srcY: 270 }, { srcX: 305, srcY: 270 }], 15, true));
}

function updateCurrentAnimationBasedOnViewVector(redbat: GameObject): void {
    let currentAnimation = getCurrentAnimation(redbat);
    const currentPosition = currentAnimation.position;

    currentAnimation = getAnimation(redbat, getCurrentState(redbat).type + getDirectionNameFromViewVector(getViewVector(redbat)));

    setCurrentAnimation(redbat, currentAnimation);
    currentAnimation.position = { ...currentPosition };
}

function getDirectionNameFromViewVector(viewVector: Vector): string {
    if (viewVector.x === 1) return "Right";
    if (viewVector.x === -1) return "Left";
    if (viewVector.y === -1) return "Up";
    return "Down";
}