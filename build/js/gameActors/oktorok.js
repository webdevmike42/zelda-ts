import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, getCurrentState } from "../state.js";
import { createRandom4DirectionViewVector, createVector, get4DirectionVector, NULL_VECTOR, reverseVector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isCoolingDown, isGameObjectDead, setAIControlled, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { addToCurrentGameObjects, createGameObject } from "../gameObjects/gameObjectFactory.js";
import { getMappedInput, isAnyMovementKeyDown, isKeyDown, KEYS, pressAndHoldKey, pressAndHoldRandomMovementKey, releaseAllKeys, reverseMovementInput } from "../KeyboardInputHandler.js";
import { createBoxInFront } from "../box.js";
import { createBullet } from "../gameObjects/bullet.js";
import { getRandomInt } from "../utils.js";
const OKTOROK_WIDTH = 16, OKTOROK_HEIGHT = 16, OKTOROK_HEALTH = 1, OKTOROK_DAMAGE = 1, OKTOROK_BULLET_WIDTH = 8, OKTOROK_BULLET_HEIGHT = 8, OKTOROK_MOVING_SPEED = 50, OKTOROK_BULLET_SPEED = 200;
export function createRedOktorok(x, y) {
    const oktorok = createGameObject(GameObjectType.OKTOROK);
    oktorok.name = "red oktorok";
    setPosition(oktorok, createVector(x, y));
    setBounds(oktorok, OKTOROK_WIDTH, OKTOROK_HEIGHT);
    setCollisionBoxFromBoundingBox(oktorok);
    setHitBoxFromBoundingBox(oktorok, OKTOROK_DAMAGE);
    setHurtBoxFromBoundingBox(oktorok);
    setHealth(oktorok, OKTOROK_HEALTH);
    setMaxHealth(oktorok, OKTOROK_HEALTH);
    addRedOktorokAnimations(oktorok);
    addOktorokStates(oktorok);
    initOktorokAI(oktorok);
    setAIControlled(oktorok);
    proposeDesignatedState(oktorok, oktorok.defaultState);
    //registerGameObjectForKeyBoardInput(oktorok);
    return oktorok;
}
function initOktorokAI(oktorok) {
    oktorok.ai_TimeRangeToNextAction[0] = 200;
    oktorok.ai_TimeRangeToNextAction[1] = 500;
    oktorok.ai_NextAction = (oktorok) => {
        releaseAllKeys(getMappedInput(oktorok));
        if (Math.random() < 0.75) {
            pressAndHoldRandomMovementKey(getMappedInput(oktorok));
        }
        else {
            pressAndHoldKey(getMappedInput(oktorok), KEYS.ACTION);
        }
        setTimeout(oktorok.ai_NextAction, getRandomInt(oktorok.ai_TimeRangeToNextAction[0], oktorok.ai_TimeRangeToNextAction[1]), oktorok);
    };
    oktorok.ai_update = (oktorok) => {
        if (oktorok.hitSolid) {
            reverseMovementInput(getMappedInput(oktorok));
            console.log("AI can react to solid collision"); //should reverse input
        }
    };
    oktorok.ai_NextAction(oktorok);
}
function addOktorokStates(oktorok) {
    const idleState = createOktorokIdleState(oktorok);
    const movingState = createOktorokMovingState(oktorok);
    addState(oktorok, CommonStateTypes.IDLE, idleState);
    addState(oktorok, CommonStateTypes.MOVING, movingState);
    addState(oktorok, CommonStateTypes.HIT, createOktorokHitState(oktorok));
    addState(oktorok, CommonStateTypes.DEATH, createOktorokDeathState(oktorok));
    addState(oktorok, CommonStateTypes.ACTION, createOktorokActionState(oktorok));
    setDefaultState(oktorok, idleState);
}
function createOktorokIdleState(oktorok) {
    const state = createEmptyState(CommonStateTypes.IDLE);
    state.name = "oktorok idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, Object.assign({}, NULL_VECTOR));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (isAnyMovementKeyDown(getMappedInput(oktorok))) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.MOVING));
            return;
        }
        if (!isCoolingDown(oktorok) && isKeyDown(getMappedInput(oktorok), KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
    };
    return state;
}
function createOktorokMovingState(oktorok) {
    const state = createEmptyState(CommonStateTypes.MOVING);
    let changeDirection = true;
    let shoot = false;
    state.enter = () => {
        changeDirection = true;
        shoot = false;
        //setTimeout(() => shoot = true, 3000);
        //setViewVector(oktorok, createVector(1,0));
        //change4Direction(oktorok);
        setMovementVector(oktorok, vectorScalarProduct(OKTOROK_MOVING_SPEED, getViewVector(oktorok)));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (!isCoolingDown(oktorok) && isKeyDown(getMappedInput(oktorok), KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
        /*
                if (shoot) {
                    proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
                    return;
                }
        
                if (changeDirection) {
                    setViewVector(oktorok, createRandom4DirectionViewVector());
                    changeDirection = false;
                    setTimeout(() => changeDirection = true, 1000);
                }
                */
        if (!isAnyMovementKeyDown(getMappedInput(oktorok))) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.IDLE));
            return;
        }
        if (oktorok.hitSolid /*&& ! isCoolingDown(oktorok)*/) {
            //console.log("reversed direction")
            //startCoolDown(oktorok,() => {},() =>{},1000);
            //oktorok.hitSolid = false;
            //setMovementVector(oktorok, reverseVector(getMovementVector(oktorok)))
            setViewVector(oktorok, reverseVector(getViewVector(oktorok)));
        }
        //else
        const movementVector = createMovementVector(getMappedInput(oktorok));
        setMovementVector(oktorok, vectorScalarProduct(OKTOROK_MOVING_SPEED, movementVector));
        setViewVector(oktorok, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(oktorok);
    };
    return state;
}
function createOktorokActionState(oktorok) {
    let durationInMS = 50;
    const state = createEmptyState(CommonStateTypes.ACTION);
    state.name = "oktorok action state";
    state.enter = () => {
        console.log("enter oktorok action state");
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, Object.assign({}, NULL_VECTOR));
        setTimeout(proposeDesignatedState, durationInMS, oktorok, getState(oktorok, CommonStateTypes.MOVING));
        spawnOktorokBullet(oktorok);
        startOktorokActionCoolDown(oktorok);
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
        if (oktorok.health && !isHitBoxOfOwnBullet(oktorok, hitBox)) {
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
function isHitBoxOfOwnBullet(oktorok, hitBox) {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet = hitBox.owner;
        return bullet.owner === oktorok;
    }
    return false;
}
function createOktorokDeathState(oktorok) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "oktorok death state";
    state.enter = () => {
        console.log("enter redOktorok death");
        setMovementVector(oktorok, Object.assign({}, NULL_VECTOR));
        disableHurtBox(oktorok);
        disableHitBox(oktorok);
        setTimeout(setVisible, 2000, oktorok, false);
    };
    return state;
}
function startOktorokActionCoolDown(oktorok) {
    startCoolDown(oktorok, () => console.log("oktorok cannot attack"), () => console.log("oktorok ready to go"), 1000);
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
function spawnOktorokBullet(oktorok) {
    const box = createBoxInFront(oktorok, OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT);
    const bullet = createBullet(getPosition(box).x, getPosition(box).y, OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT, oktorok, OKTOROK_DAMAGE, OKTOROK_BULLET_SPEED, getViewVector(oktorok));
    addOktorokBulletAnimations(bullet);
    addToCurrentGameObjects(bullet);
}
function addOktorokBulletStates(oktorokBullet) {
    const actionState = createOktorokBulletActionState(oktorokBullet);
    addState(oktorokBullet, CommonStateTypes.ACTION, actionState);
    setDefaultState(oktorokBullet, actionState);
}
function addOktorokBulletAnimations(oktorokBullet) {
    addAnimation(oktorokBullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(oktorokBullet), OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT, [{ srcX: 394, srcY: 228 }], 1, false), true);
}
function createOktorokBulletActionState(oktorokBullet) {
    const state = createEmptyState(CommonStateTypes.ACTION);
    state.name = "BULLET action state";
    state.enter = () => {
        //console.log("enter " + state.name)
        //setMovementVector(oktorokBullet, vectorScalarProduct(OKTOROK_BULLET_SPEED, {...getViewVector(oktorokBullet.owner)}));
    };
    state.update = (currentGameTime, timeSinceLastTick) => {
        /*
        if(oktorokBullet.hitSolid)
            proposeDesignatedState(oktorokBullet, getState(oktorokBullet, CommonStateTypes.DEATH));
            */
    };
    return state;
}
function change4Direction(oktorok) {
    //console.log("changed direction");
    setViewVector(oktorok, createRandom4DirectionViewVector());
    //setTimeout(change4Direction, 1000, oktorok);
}
