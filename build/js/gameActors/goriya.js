import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { boxesOverlap, getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "./player.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, getCurrentState } from "../state.js";
import { createVector, get4DirectionVector, NULL_VECTOR, reverseVector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isCoolingDown, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { addToCurrentGameObjects, createGameObject } from "../gameObjects/gameObjectFactory.js";
import { getMappedInput, isAnyMovementKeyDown, isKeyDown, KEYS, pressAndHoldKey, pressAndHoldRandomMovementKey, registerGameObjectForKeyBoardInput, releaseAllKeys, reverseMovementInput } from "../KeyboardInputHandler.js";
import { createBoxInFront } from "../box.js";
import { createBullet, createBulletDeathState } from "../gameObjects/bullet.js";
import { getRandomInt } from "../utils.js";
import { createEnemyHitState } from "./enemy.js";
const GORIYA_WIDTH = 16, GORIYA_HEIGHT = 16, GORIYA_HEALTH = 1, GORIYA_DAMAGE = 1, GORIYA_BULLET_WIDTH = 8, GORIYA_BULLET_HEIGHT = 8, GORIYA_MOVING_SPEED = 100, GORIYA_BULLET_SPEED = 200;
export function createRedGoriya(x, y) {
    const goriya = createGameObject(GameObjectType.GORIYA);
    goriya.name = "red goriya";
    setPosition(goriya, createVector(x, y));
    setBounds(goriya, GORIYA_WIDTH, GORIYA_HEIGHT);
    setCollisionBoxFromBoundingBox(goriya);
    setHitBoxFromBoundingBox(goriya, GORIYA_DAMAGE);
    setHurtBoxFromBoundingBox(goriya);
    setHealth(goriya, GORIYA_HEALTH);
    setMaxHealth(goriya, GORIYA_HEALTH);
    addRedGoriyaAnimations(goriya);
    addGoriyaStates(goriya);
    //initGoriyaAI(goriya);
    //setAIControlled(goriya);
    proposeDesignatedState(goriya, goriya.defaultState);
    registerGameObjectForKeyBoardInput(goriya);
    return goriya;
}
function initGoriyaAI(goriya) {
    goriya.ai_TimeRangeToNextAction[0] = 200;
    goriya.ai_TimeRangeToNextAction[1] = 500;
    goriya.ai_NextAction = (goriya) => {
        releaseAllKeys(getMappedInput(goriya));
        if (Math.random() < 0.75) {
            pressAndHoldRandomMovementKey(getMappedInput(goriya));
        }
        else {
            pressAndHoldKey(getMappedInput(goriya), KEYS.ACTION);
        }
        setTimeout(goriya.ai_NextAction, getRandomInt(goriya.ai_TimeRangeToNextAction[0], goriya.ai_TimeRangeToNextAction[1]), goriya);
    };
    goriya.ai_update = (goriya) => {
        if (goriya.hitSolid) {
            reverseMovementInput(getMappedInput(goriya));
            console.log("AI can react to solid collision"); //should reverse input
        }
    };
    goriya.ai_NextAction(goriya);
}
function addGoriyaStates(goriya) {
    const idleState = createGoriyaIdleState(goriya);
    const movingState = createGoriyaMovingState(goriya);
    addState(goriya, CommonStateTypes.IDLE, idleState);
    addState(goriya, CommonStateTypes.MOVING, movingState);
    addState(goriya, CommonStateTypes.HIT, createEnemyHitState(goriya));
    addState(goriya, CommonStateTypes.DEATH, createGoriyaDeathState(goriya));
    addState(goriya, CommonStateTypes.ACTION, createGoriyaActionState(goriya));
    setDefaultState(goriya, idleState);
}
function createGoriyaIdleState(goriya) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "goriya idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(goriya);
        setMovementVector(goriya, Object.assign({}, NULL_VECTOR));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (isAnyMovementKeyDown(getMappedInput(goriya))) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.MOVING));
            return;
        }
        if (!isCoolingDown(goriya) && isKeyDown(getMappedInput(goriya), KEYS.ACTION)) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.ACTION));
            return;
        }
    };
    return state;
}
function createGoriyaMovingState(goriya) {
    const state = createEmptyState(CommonStateTypes.MOVING);
    let changeDirection = true;
    let shoot = false;
    state.enter = () => {
        changeDirection = true;
        shoot = false;
        //setTimeout(() => shoot = true, 3000);
        //setViewVector(goriya, createVector(1,0));
        //change4Direction(goriya);
        setMovementVector(goriya, vectorScalarProduct(GORIYA_MOVING_SPEED, getViewVector(goriya)));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isCoolingDown(goriya) && isKeyDown(getMappedInput(goriya), KEYS.ACTION)) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.ACTION));
            return;
        }
        /*
                if (shoot) {
                    proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.ACTION));
                    return;
                }
        
                if (changeDirection) {
                    setViewVector(goriya, createRandom4DirectionViewVector());
                    changeDirection = false;
                    setTimeout(() => changeDirection = true, 1000);
                }
                */
        if (!isAnyMovementKeyDown(getMappedInput(goriya))) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.IDLE));
            return;
        }
        if (goriya.hitSolid /*&& ! isCoolingDown(goriya)*/) {
            //console.log("reversed direction")
            //startCoolDown(goriya,() => {},() =>{},1000);
            //goriya.hitSolid = false;
            //setMovementVector(goriya, reverseVector(getMovementVector(goriya)))
            setViewVector(goriya, reverseVector(getViewVector(goriya)));
        }
        //else
        const movementVector = createMovementVector(getMappedInput(goriya));
        setMovementVector(goriya, vectorScalarProduct(GORIYA_MOVING_SPEED, movementVector));
        setViewVector(goriya, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(goriya);
    };
    return state;
}
function createGoriyaActionState(goriya) {
    let durationInMS = 500;
    const state = createEmptyState(CommonStateTypes.ACTION);
    state.name = "goriya action state";
    state.enter = () => {
        console.log("enter goriya action state");
        updateCurrentAnimationBasedOnViewVector(goriya);
        setMovementVector(goriya, Object.assign({}, NULL_VECTOR));
        setTimeout(proposeDesignatedState, durationInMS, goriya, getState(goriya, CommonStateTypes.IDLE));
        spawnGoriyaBullet(goriya);
        startGoriyaActionCoolDown(goriya);
    };
    return state;
}
/*
function createGoriyaHitState(goriya: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "goriya hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.update = () => {
        if (!isHitByPlayer(hitBox) || isHitBoxOfOwnBullet(goriya, hitBox)) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.IDLE));
            return;
        }

        doDamage(goriya, hitBox.damage);
        proposeDesignatedState(goriya, getState(goriya, isGameObjectDead(goriya) ? CommonStateTypes.DEATH : CommonStateTypes.IDLE));
    }
    return state;
}


function isHitByPlayer(hitBox:HitBox):boolean{
    return hitBox.owner.type === GameObjectType.PLAYER;
}

export function isHitBoxOfOwnBullet(goriya: GameObject, hitBox: HitBox): boolean {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet: Bullet = hitBox.owner as Bullet;
        return bullet.owner === goriya;
    }
    return false;
}
*/
function createGoriyaDeathState(goriya) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "goriya death state";
    state.enter = () => {
        console.log("enter redGoriya death");
        setMovementVector(goriya, Object.assign({}, NULL_VECTOR));
        disableHurtBox(goriya);
        disableHitBox(goriya);
        setTimeout(setVisible, 2000, goriya, false);
    };
    return state;
}
function startGoriyaActionCoolDown(goriya) {
    startCoolDown(goriya, () => console.log("goriya cannot attack"), () => console.log("goriya ready to go"), 1000);
}
function addRedGoriyaAnimations(goriya) {
    addGoriyaIdleAnimations(goriya);
    addGoriyaMovingAnimations(goriya);
    addGoriyaActionAnimations(goriya);
}
function addGoriyaIdleAnimations(goriya) {
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }], 1, false));
}
function addGoriyaMovingAnimations(goriya) {
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }, { srcX: 60, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }, { srcX: 30, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }, { srcX: 0, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }, { srcX: 90, srcY: 90 }], 6, true));
}
function addGoriyaActionAnimations(goriya) {
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }], 1, false));
}
function updateCurrentAnimationBasedOnViewVector(goriya) {
    let currentAnimation = getCurrentAnimation(goriya);
    const currentPosition = currentAnimation.position;
    currentAnimation = getAnimation(goriya, getCurrentState(goriya).type + getDirectionNameFromViewVector(getViewVector(goriya)));
    setCurrentAnimation(goriya, currentAnimation);
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
function spawnGoriyaBullet(goriya) {
    const box = createBoxInFront(goriya, GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT);
    const goriyaBullet = createBullet(getPosition(box).x, getPosition(box).y, GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT, goriya, GORIYA_DAMAGE, GORIYA_BULLET_SPEED, getViewVector(goriya), false);
    addGoriyaBulletStates(goriyaBullet);
    addGoriyaBulletAnimations(goriyaBullet);
    proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.MOVING));
    addToCurrentGameObjects(goriyaBullet);
}
function addGoriyaBulletAnimations(goriyaBullet) {
    addAnimation(goriyaBullet, createAnimation(CommonStateTypes.MOVING, "./resources/enemies.png", getPosition(goriyaBullet), GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT, [{ srcX: 394, srcY: 238, width: 8, height: 5 },
        { srcX: 388, srcY: 268, width: 8, height: 8 },
        { srcX: 390, srcY: 244, width: 5, height: 8 },
        { srcX: 388, srcY: 279, width: 8, height: 8 },
        { srcX: 394, srcY: 253, width: 8, height: 5 },
        { srcX: 399, srcY: 279, width: 8, height: 8 },
        { srcX: 401, srcY: 244, width: 5, height: 8 },
        { srcX: 399, srcY: 269, width: 8, height: 8 }], 24, true), true);
}
function addGoriyaBulletStates(goriyaBullet) {
    const movingState = createGoriyaBulletMovingState(goriyaBullet);
    addState(goriyaBullet, CommonStateTypes.MOVING, movingState);
    addState(goriyaBullet, CommonStateTypes.DEATH, createBulletDeathState(goriyaBullet));
    setDefaultState(goriyaBullet, movingState);
}
function createGoriyaBulletMovingState(goriyaBullet) {
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.name = "BULLET moving state";
    state.enter = () => {
        setMovementVector(goriyaBullet, vectorScalarProduct(GORIYA_BULLET_SPEED, getViewVector(goriyaBullet)));
        setTimeout(reverseGoriyaBulletDirection, 250, goriyaBullet);
    };
    state.update = () => {
        if (goriyaBullet.hitSolid) {
            proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.DEATH));
            return;
        }
        if (bulletCollidedWithOwner(goriyaBullet) || bulletCollidedWithPlayerHurtBox(goriyaBullet)) {
            console.log("death");
            proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.DEATH));
            return;
        }
        setMovementVector(goriyaBullet, vectorScalarProduct(GORIYA_BULLET_SPEED, getViewVector(goriyaBullet)));
    };
    return state;
}
function bulletCollidedWithOwner(bullet) {
    return getCollidingGameObjects(bullet, getCollisionBox(bullet), [bullet.owner]).length > 0;
}
function bulletCollidedWithPlayerHurtBox(bullet) {
    const playerHurtBox = getPlayer().hurtBox;
    return bullet.hitBox !== undefined && playerHurtBox !== undefined && boxesOverlap(bullet.hitBox, playerHurtBox);
}
function reverseGoriyaBulletDirection(goriyaBullet) {
    setViewVector(goriyaBullet, reverseVector(getViewVector(goriyaBullet)));
}
