import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "./player.js";
import { disableHitBox, enableHitBox, HitBox, removeHitBox, setHitBoxFromBoundingBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, isHurtBoxEnabled, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { getCurrentGameObjects, removeGameObject } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, getCurrentState, setCurrentState } from "../state.js";
import { createRandom4DirectionViewVector, createVector, get4DirectionVector, NULL_VECTOR, reverseVector, Vector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getMovementVector, getOverallVector, getPosition, getViewVector, isCoolingDown, isGameObjectDead, setAIControlled, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { addToCurrentGameObjects, createGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { getMappedInput, isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS, pressAndHoldKey, pressAndHoldRandomMovementKey, pressKey, registerGameObjectForKeyBoardInput, releaseAllKeys, releaseKey, reverseMovementInput } from "../KeyboardInputHandler.js";
import { Item } from "../gameObjects/item.js";
import { Box, createBoxInFront } from "../box.js";
import { Bullet, createBullet, createBulletDeathState } from "../gameObjects/bullet.js";
import { getRandomInt } from "../utils.js";

const GORIYA_WIDTH = 16, GORIYA_HEIGHT = 16, GORIYA_HEALTH = 1, GORIYA_DAMAGE = 1, GORIYA_BULLET_WIDTH = 8, GORIYA_BULLET_HEIGHT = 8, GORIYA_MOVING_SPEED = 50, GORIYA_BULLET_SPEED = 200;

export function createRedGoriya(x: number, y: number): GameObject {
    const goriya: GameObject = createGameObject(GameObjectType.GORIYA);
    goriya.name = "red goriya"
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

function initGoriyaAI(goriya: GameObject): void {
    goriya.ai_TimeRangeToNextAction[0] = 200;
    goriya.ai_TimeRangeToNextAction[1] = 500;
    goriya.ai_NextAction = (goriya: GameObject) => {

        releaseAllKeys(getMappedInput(goriya));

        if (Math.random() < 0.75) {
            pressAndHoldRandomMovementKey(getMappedInput(goriya));
        } else {
            pressAndHoldKey(getMappedInput(goriya), KEYS.ACTION);
        }

        setTimeout(goriya.ai_NextAction, getRandomInt(goriya.ai_TimeRangeToNextAction[0], goriya.ai_TimeRangeToNextAction[1]), goriya)
    }

    goriya.ai_update = (goriya: GameObject) => {
        if (goriya.hitSolid) {
            reverseMovementInput(getMappedInput(goriya));
            console.log("AI can react to solid collision"); //should reverse input
        }
    }

    goriya.ai_NextAction(goriya);
}

function addGoriyaStates(goriya: GameObject): void {
    const idleState: State = createGoriyaIdleState(goriya);
    const movingState: State = createGoriyaMovingState(goriya);
    addState(goriya, CommonStateTypes.IDLE, idleState);
    addState(goriya, CommonStateTypes.MOVING, movingState);
    addState(goriya, CommonStateTypes.HIT, createGoriyaHitState(goriya));
    addState(goriya, CommonStateTypes.DEATH, createGoriyaDeathState(goriya));
    addState(goriya, CommonStateTypes.ACTION, createGoriyaActionState(goriya));
    setDefaultState(goriya, idleState);
}

function createGoriyaIdleState(goriya: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "goriya idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(goriya);
        setMovementVector(goriya, { ...NULL_VECTOR });
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (isAnyMovementKeyDown(getMappedInput(goriya))) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.MOVING));
            return;
        }

        if (!isCoolingDown(goriya) && isKeyDown(getMappedInput(goriya), KEYS.ACTION)) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.ACTION));
            return;
        }
    }
    return state;
}

function createGoriyaMovingState(goriya: GameObject): State {
    const state = createEmptyState(CommonStateTypes.MOVING);
    let changeDirection: boolean = true;
    let shoot: boolean = false;
    state.enter = () => {
        changeDirection = true;
        shoot = false;
        //setTimeout(() => shoot = true, 3000);

        //setViewVector(goriya, createVector(1,0));

        //change4Direction(goriya);
        setMovementVector(goriya, vectorScalarProduct(GORIYA_MOVING_SPEED, getViewVector(goriya)));
    }

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {

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


    }
    return state;
}

function createGoriyaActionState(goriya: GameObject): State {
    let durationInMS: number = 50;
    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "goriya action state";
    state.enter = () => {
        console.log("enter goriya action state")
        updateCurrentAnimationBasedOnViewVector(goriya);
        setMovementVector(goriya, { ...NULL_VECTOR });
        setTimeout(proposeDesignatedState, durationInMS, goriya, getState(goriya, CommonStateTypes.MOVING));
        spawnGoriyaBullet(goriya);
        startGoriyaActionCoolDown(goriya);
    }
    return state;
}


function createGoriyaHitState(goriya: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "goriya hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.enter = () => {
        if (goriya.health && !isHitBoxOfOwnBullet(goriya, hitBox)) {
            goriya.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(goriya)) {
            proposeDesignatedState(goriya, getState(goriya, CommonStateTypes.DEATH));
        }
    }
    return state;
}

function isHitBoxOfOwnBullet(goriya: GameObject, hitBox: HitBox): boolean {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet: Bullet = hitBox.owner as Bullet;
        return bullet.owner === goriya;
    }
    return false;
}

function createGoriyaDeathState(goriya: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "goriya death state";

    state.enter = () => {
        console.log("enter redGoriya death")
        setMovementVector(goriya, { ...NULL_VECTOR });
        disableHurtBox(goriya);
        disableHitBox(goriya);
        setTimeout(setVisible, 2000, goriya, false);
    };
    return state;
}

function startGoriyaActionCoolDown(goriya: GameObject): void {
    startCoolDown(goriya, () => console.log("goriya cannot attack"), () => console.log("goriya ready to go"), 1000)
}

function addRedGoriyaAnimations(goriya: GameObject): void {
    addGoriyaIdleAnimations(goriya);
    addGoriyaMovingAnimations(goriya);
    addGoriyaActionAnimations(goriya);
}

function addGoriyaIdleAnimations(goriya: GameObject): void {
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }], 1, false));
}

function addGoriyaMovingAnimations(goriya: GameObject): void {
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }, { srcX: 60, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }, { srcX: 30, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }, { srcX: 0, srcY: 90 }], 6, true));
    addAnimation(goriya, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }, { srcX: 90, srcY: 90 }], 6, true));
}

function addGoriyaActionAnimations(goriya: GameObject): void {
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 60, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 30, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 0, srcY: 60 }], 1, false));
    addAnimation(goriya, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/enemies.png", getPosition(goriya), goriya.width, goriya.height, [{ srcX: 90, srcY: 60 }], 1, false));
}

function updateCurrentAnimationBasedOnViewVector(goriya: GameObject): void {
    let currentAnimation = getCurrentAnimation(goriya);
    const currentPosition = currentAnimation.position;

    currentAnimation = getAnimation(goriya, getCurrentState(goriya).type + getDirectionNameFromViewVector(getViewVector(goriya)));

    setCurrentAnimation(goriya, currentAnimation);
    currentAnimation.position = { ...currentPosition };
}

function getDirectionNameFromViewVector(viewVector: Vector): string {
    if (viewVector.x === 1) return "Right";
    if (viewVector.x === -1) return "Left";
    if (viewVector.y === -1) return "Up";
    return "Down";
}

function spawnGoriyaBullet(goriya: GameObject): void {
    const box: Box = createBoxInFront(goriya, GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT);
    const goriyaBullet: Bullet = createBullet(getPosition(box).x, getPosition(box).y, GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT, goriya, GORIYA_DAMAGE, GORIYA_BULLET_SPEED, getViewVector(goriya), false);
    addGoriyaBulletStates(goriyaBullet);
    addGoriyaBulletAnimations(goriyaBullet);
    proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.MOVING));
    addToCurrentGameObjects(goriyaBullet);
}

function addGoriyaBulletAnimations(goriyaBullet: Bullet): void {
    addAnimation(goriyaBullet, createAnimation(CommonStateTypes.MOVING, "./resources/enemies.png", getPosition(goriyaBullet), GORIYA_BULLET_WIDTH, GORIYA_BULLET_HEIGHT,
        [{ srcX: 394, srcY: 238, width: 8, height: 5 },
        { srcX: 388, srcY: 268, width: 8, height: 8 },
        { srcX: 390, srcY: 244, width: 5, height: 8 },
        { srcX: 388, srcY: 279, width: 8, height: 8 },
        { srcX: 394, srcY: 253, width: 8, height: 5 },
        { srcX: 399, srcY: 279, width: 8, height: 8 },
        { srcX: 401, srcY: 244, width: 5, height: 8 },
        { srcX: 399, srcY: 269, width: 8, height: 8 }],
        24, true), true);
}

function addGoriyaBulletStates(goriyaBullet: Bullet): void {
    const movingState: State = createGoriyaBulletMovingState(goriyaBullet);
    addState(goriyaBullet, CommonStateTypes.MOVING, movingState);
    addState(goriyaBullet, CommonStateTypes.DEATH, createBulletDeathState(goriyaBullet));
    setDefaultState(goriyaBullet, movingState);
}

function createGoriyaBulletMovingState(goriyaBullet: Bullet): State {
    const state: State = createEmptyState(CommonStateTypes.MOVING);
    state.name = "BULLET moving state";
    let movementVector = vectorScalarProduct(GORIYA_BULLET_SPEED, goriyaBullet.viewVector);


    state.enter = () => {
        setMovementVector(goriyaBullet, vectorScalarProduct(GORIYA_BULLET_SPEED, getViewVector(goriyaBullet)));
        setTimeout(reverseGoriyaBulletDirection, 500, goriyaBullet);
    }
    state.update = () => {
        if (goriyaBullet.hitSolid) {
            proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.DEATH));
            return;
        }

        if (getCollidingGameObjects(goriyaBullet, getCollisionBox(goriyaBullet), [goriyaBullet.owner]).length > 0) {
            proposeDesignatedState(goriyaBullet, getState(goriyaBullet, CommonStateTypes.DEATH));
            return;
        }

        setMovementVector(goriyaBullet, vectorScalarProduct(GORIYA_BULLET_SPEED, getViewVector(goriyaBullet)));
    }
    return state;
}

function reverseGoriyaBulletDirection(goriyaBullet: Bullet): void {
    setViewVector(goriyaBullet, reverseVector(getViewVector(goriyaBullet)));

}
