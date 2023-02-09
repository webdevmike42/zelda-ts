import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
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
import { Box, createBoxInFront } from "../box.js";
import { Bullet, createBullet } from "../gameObjects/bullet.js";
import { getRandomInt } from "../utils.js";

const STALFOS_WIDTH = 16, STALFOS_HEIGHT = 16, STALFOS_HEALTH = 1, STALFOS_DAMAGE = 1, STALFOS_BULLET_WIDTH = 8, STALFOS_BULLET_HEIGHT = 8, STALFOS_MOVING_SPEED = 20, STALFOS_BULLET_SPEED = 200;

export function createStalfos(x: number, y: number): GameObject {
    const stalfos: GameObject = createGameObject(GameObjectType.STALFOS);
    stalfos.name = "stalfos"
    setPosition(stalfos, createVector(x, y));
    setBounds(stalfos, STALFOS_WIDTH, STALFOS_HEIGHT);
    setCollisionBoxFromBoundingBox(stalfos);
    setHitBoxFromBoundingBox(stalfos, STALFOS_DAMAGE);
    setHurtBoxFromBoundingBox(stalfos);
    setHealth(stalfos, STALFOS_HEALTH);
    setMaxHealth(stalfos, STALFOS_HEALTH);
    addStalfosAnimations(stalfos);
    addStalfosStates(stalfos);
    //initStalfosAI(stalfos);
    //setAIControlled(stalfos);
    proposeDesignatedState(stalfos, stalfos.defaultState);
    setPlayerControlled(stalfos);
    registerGameObjectForKeyBoardInput(stalfos);

    return stalfos;
}

function initStalfosAI(stalfos: GameObject): void {
    stalfos.ai_TimeRangeToNextAction[0] = 200;
    stalfos.ai_TimeRangeToNextAction[1] = 500;
    stalfos.ai_NextAction = (stalfos: GameObject) => {

        releaseAllKeys(getMappedInput(stalfos));
        pressAndHoldRandomMovementKey(getMappedInput(stalfos));

        /*
        if (Math.random() < 0.75) {
            pressAndHoldRandomMovementKey(getMappedInput(stalfos));
        } else {
            pressAndHoldKey(getMappedInput(stalfos), KEYS.ACTION);
        }
*/
        setTimeout(stalfos.ai_NextAction, getRandomInt(stalfos.ai_TimeRangeToNextAction[0], stalfos.ai_TimeRangeToNextAction[1]), stalfos)
    }

    stalfos.ai_update = (stalfos: GameObject) => {
        if (stalfos.hitSolid) {
            reverseMovementInput(getMappedInput(stalfos));
            console.log("AI can react to solid collision"); //should reverse input
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
    //addState(stalfos, CommonStateTypes.ACTION, createStalfosActionState(stalfos));
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

        if (!isCoolingDown(stalfos) && isKeyDown(getMappedInput(stalfos), KEYS.ACTION)) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.ACTION));
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
/*
        if (!isCoolingDown(stalfos) && isKeyDown(getMappedInput(stalfos), KEYS.ACTION)) {
            proposeDesignatedState(stalfos, getState(stalfos, CommonStateTypes.ACTION));
            return;
        }
        */

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

/*
function createStalfosActionState(stalfos: GameObject): State {
    let durationInMS: number = 50;
    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "stalfos action state";
    state.enter = () => {
        console.log("enter stalfos action state")
        updateCurrentAnimationBasedOnViewVector(stalfos);
        setMovementVector(stalfos, { ...NULL_VECTOR });
        setTimeout(proposeDesignatedState, durationInMS, stalfos, getState(stalfos, CommonStateTypes.MOVING));
        spawnStalfosBullet(stalfos);
        startStalfosActionCoolDown(stalfos);
    }
    return state;
}
*/


function createStalfosHitState(stalfos: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "stalfos hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.enter = () => {
        if (stalfos.health /*&& !isHitBoxOfOwnBullet(stalfos, hitBox)*/) {
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

/*
function isHitBoxOfOwnBullet(stalfos: GameObject, hitBox: HitBox): boolean {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet: Bullet = hitBox.owner as Bullet;
        return bullet.owner === stalfos;
    }
    return false;
}
*/

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

/*
function startStalfosActionCoolDown(stalfos: GameObject): void {
    startCoolDown(stalfos, () => console.log("stalfos cannot attack"), () => console.log("stalfos ready to go"), 1000)
}
*/

function addStalfosAnimations(stalfos: GameObject): void {
    addStalfosIdleAnimations(stalfos);
    addStalfosMovingAnimations(stalfos);
    //addStalfosActionAnimations(stalfos);
}

function addStalfosIdleAnimations(stalfos: GameObject): void {
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }], 1, false));
}

function addStalfosMovingAnimations(stalfos: GameObject): void {
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 2, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 2, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 2, true));
    addAnimation(stalfos, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 420, srcY: 120 }, { srcX: 420, srcY: 150 }], 2, true));
}
/*
function addStalfosActionAnimations(stalfos: GameObject): void {
    addAnimation(stalfos, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 60, srcY: 30 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 30, srcY: 30 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 0, srcY: 30 }], 1, false));
    addAnimation(stalfos, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/enemies.png", getPosition(stalfos), stalfos.width, stalfos.height, [{ srcX: 90, srcY: 30 }], 1, false));
}
*/

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

/*
function spawnStalfosBullet(stalfos: GameObject): void {
    const box: Box = createBoxInFront(stalfos, STALFOS_BULLET_WIDTH, STALFOS_BULLET_HEIGHT);
    addToCurrentGameObjects(
        createBullet(getPosition(box).x, getPosition(box).y, STALFOS_BULLET_WIDTH, STALFOS_BULLET_HEIGHT, stalfos, STALFOS_DAMAGE, STALFOS_BULLET_SPEED, getViewVector(stalfos))
    );
}
*/
/*
function addStalfosBulletStates(stalfosBullet: Bullet): void {
    const actionState: State = createStalfosBulletActionState(stalfosBullet);
    addState(stalfosBullet, CommonStateTypes.ACTION, actionState);
    setDefaultState(stalfosBullet, actionState);
}

function addStalfosBulletAnimations(stalfosBullet: Bullet): void {
    addAnimation(stalfosBullet, createAnimation(CommonStateTypes.IDLE, "./resources/link.png", getPosition(stalfosBullet), STALFOS_BULLET_WIDTH, STALFOS_BULLET_HEIGHT, [{ srcX: 394, srcY: 228 }], 1, false), true);
}

function createStalfosBulletActionState(stalfosBullet: Bullet): State {
    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "BULLET action state";
    state.enter = () => {
        //console.log("enter " + state.name)
        //setMovementVector(stalfosBullet, vectorScalarProduct(STALFOS_BULLET_SPEED, {...getViewVector(stalfosBullet.owner)}));
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
       
    }
    return state;
}

function change4Direction(stalfos: GameObject): void {
    //console.log("changed direction");
    setViewVector(stalfos, createRandom4DirectionViewVector());
    //setTimeout(change4Direction, 1000, stalfos);
}
*/