import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "../gameActors/player.js";
import { disableHitBox, enableHitBox, HitBox, removeHitBox, setHitBoxFromBoundingBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, isHurtBoxEnabled, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, getCurrentState } from "../state.js";
import { createRandom4DirectionViewVector, createVector, get4DirectionVector, NULL_VECTOR, reverseVector, Vector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isCoolingDown, isGameObjectDead, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { addToCurrentGameObjects, createGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS } from "../KeyboardInputHandler.js";
import { Item } from "../gameObjects/item.js";
import { Box, createBoxInFront } from "../box.js";
import { Bullet, createBullet } from "../gameObjects/bullet.js";

const OKTOROK_WIDTH = 16, OKTOROK_HEIGHT = 16, OKTOROK_HEALTH = 1, OKTOROK_DAMAGE = 1, OKTOROK_BULLET_WIDTH = 8, OKTOROK_BULLET_HEIGHT = 8, OKTOROK_BULLET_SPEED = 200;

export function createRedOktorok(x: number, y: number): GameObject {
    const oktorok: GameObject = createGameObject(GameObjectType.OKTOROK);
    oktorok.name = "red oktorok"
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

function addOktorokStates(oktorok: GameObject): void {
    const idleState: State = createOktorokIdleState(oktorok);
    addState(oktorok, CommonStateTypes.IDLE, idleState);
    addState(oktorok, CommonStateTypes.MOVING, createOktorokMovingState(oktorok));
    addState(oktorok, CommonStateTypes.HIT, createOktorokHitState(oktorok));
    addState(oktorok, CommonStateTypes.DEATH, createOktorokDeathState(oktorok));
    addState(oktorok, CommonStateTypes.ACTION, createOktorokActionState(oktorok));
    setDefaultState(oktorok, idleState);
}

function createOktorokIdleState(oktorok: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "oktorok idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, { ...NULL_VECTOR });
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.MOVING));
            return;
        }

        if (!isCoolingDown(oktorok) && isKeyDown(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
    }
    return state;
}

function createOktorokMovingState(oktorok: GameObject): State {
    let movingSpeed: number = 100;
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (!isCoolingDown(oktorok) && isKeyDown(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }

        if (!isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.IDLE));
            return;
        }

        //const movementVector = createMovementVector();
        const movementVector = createRandom4DirectionViewVector();
        setMovementVector(oktorok, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(oktorok, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(oktorok);
    }
    return state;
}


function createOktorokHitState(oktorok: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.HIT);
    let hitBox: HitBox;
    state.name = "oktorok hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.enter = () => {
        if (oktorok.health && !isHitBoxOfOwnBullet(oktorok, hitBox)) {
            oktorok.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(oktorok)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.DEATH));
        }
    }
    return state;
}

function isHitBoxOfOwnBullet(oktorok: GameObject, hitBox: HitBox): boolean {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet: Bullet = hitBox.owner as Bullet;
        console.log(bullet.owner === oktorok)
        return bullet.owner === oktorok;
    }
    return false;
}

function createOktorokDeathState(oktorok: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "oktorok death state";

    state.enter = () => {
        console.log("enter redOktorok death")
        setMovementVector(oktorok,{...NULL_VECTOR});
        disableHurtBox(oktorok);
        disableHitBox(oktorok);
        setTimeout(setVisible,2000,oktorok,false);
    };
    return state;
}

function createOktorokActionState(oktorok: GameObject): State {
    let durationInMS: number = 50;
    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "oktorok action state";
    state.enter = () => {

        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, { ...NULL_VECTOR });
        setTimeout(proposeDesignatedState, durationInMS, oktorok, getState(oktorok, CommonStateTypes.IDLE));
        spawnOktorokBullet(oktorok);
        startOktorokActionCoolDown(oktorok);
    }
    return state;
}

function startOktorokActionCoolDown(oktorok: GameObject): void {
    startCoolDown(oktorok, () => console.log("oktorok cannot attack"), () => console.log("oktorok ready to go"), 1000)
}

function addRedOktorokAnimations(oktorok: GameObject): void {
    addOktorokIdleAnimations(oktorok);
    addOktorokMovingAnimations(oktorok);
    addOktorokActionAnimations(oktorok);
}

function addOktorokIdleAnimations(oktorok: GameObject): void {
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 }], 1, false));
}

function addOktorokMovingAnimations(oktorok: GameObject): void {
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 }, { srcX: 60, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 }, { srcX: 90, srcY: 30 }], 6, true));
}

function addOktorokActionAnimations(oktorok: GameObject): void {
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 30 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 30 }], 1, false));
}

function updateCurrentAnimationBasedOnViewVector(oktorok: GameObject): void {
    let currentAnimation = getCurrentAnimation(oktorok);
    const currentPosition = currentAnimation.position;

    currentAnimation = getAnimation(oktorok, getCurrentState(oktorok).type + getDirectionNameFromViewVector(getViewVector(oktorok)));

    setCurrentAnimation(oktorok, currentAnimation);
    currentAnimation.position = { ...currentPosition };
}

function getDirectionNameFromViewVector(viewVector: Vector): string {
    if (viewVector.x === 1) return "Right";
    if (viewVector.x === -1) return "Left";
    if (viewVector.y === -1) return "Up";
    return "Down";
}

function spawnOktorokBullet(oktorok: GameObject): void {
    const box: Box = createBoxInFront(oktorok, OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT);
    addToCurrentGameObjects(
        createBullet(getPosition(box).x, getPosition(box).y, OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT, oktorok, OKTOROK_DAMAGE, OKTOROK_BULLET_SPEED, getViewVector(oktorok))
    );
}

function addOktorokBulletStates(oktorokBullet: Bullet): void {
    const actionState: State = createOktorokBulletActionState(oktorokBullet);
    addState(oktorokBullet, CommonStateTypes.ACTION, actionState);
    setDefaultState(oktorokBullet, actionState);
}

function addOktorokBulletAnimations(oktorokBullet: Bullet): void {
    addAnimation(oktorokBullet, createAnimation(CommonStateTypes.IDLE, "./resources/link.png", getPosition(oktorokBullet), OKTOROK_BULLET_WIDTH, OKTOROK_BULLET_HEIGHT, [{ srcX: 394, srcY: 228 }], 1, false), true);
}

function createOktorokBulletActionState(oktorokBullet: Bullet): State {
    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "BULLET action state";
    state.enter = () => {
        console.log("enter " + state.name)
        //setMovementVector(oktorokBullet, vectorScalarProduct(OKTOROK_BULLET_SPEED, {...getViewVector(oktorokBullet.owner)}));
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        /*
        if(oktorokBullet.hitSolid)
            proposeDesignatedState(oktorokBullet, getState(oktorokBullet, CommonStateTypes.DEATH));
            */
    }
    return state;
}