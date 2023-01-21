import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getPlayer } from "../gameActors/player.js";
import { disableHitBox, enableHitBox, HitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, isHurtBoxEnabled, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, switchToState, getCurrentState } from "../state.js";
import { createVector, get4DirectionVector, NULL_VECTOR, reverseVector, Vector, vectorScalarProduct } from "../vector.js";
import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isGameObjectDead, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { createGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { isAnyMovementKeyDown, isKeyPressed, KEYS } from "../KeyboardInputHandler.js";
import { Item } from "../gameObjects/item.js";

const OKTOROK_WIDTH = 16, OKTOROK_HEIGHT = 16, OKTOROK_HEALTH = 1, OKTOROK_DAMAGE = 1;

export function createRedOktorok(x: number, y: number): GameObject {
    const oktorok: GameObject = createGameObject(GameObjectType.OKTOROK);
    oktorok.name = "oktorok"
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
    setDefaultState(oktorok, idleState);
}

function createOktorokIdleState(oktorok: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "oktorok idle state";
    state.enter = () => {
        console.log("entered" + state.name)
        updateCurrentAnimationBasedOnViewVector(oktorok);
        setMovementVector(oktorok, { ...NULL_VECTOR });
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.MOVING));
            return;
        }
        /*
        if (isKeyPressed(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
        */
    }
    state.exit = () => { };
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
        if (oktorok.health) {
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

function createOktorokDeathState(oktorok: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "oktorok death state";

    state.enter = () => {
        console.log("enter redOktorok death")
        disableHurtBox(oktorok);
        disableHitBox(oktorok);

    };
    return state;
}

function createOktorokMovingState(oktorok: GameObject): State {
    let movingSpeed:number = 100;
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        /*
        if (oktorok.hitSolid) {
            movementVector = reverseVector(movementVector);
        }*/
/*
        if (isKeyPressed(KEYS.ACTION)) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.ACTION));
            return;
        }
        */
        if (!isAnyMovementKeyDown()) {
            proposeDesignatedState(oktorok, getState(oktorok, CommonStateTypes.IDLE));
            return;
        }

        const movementVector = createMovementVector();
        setMovementVector(oktorok, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(oktorok, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(oktorok);
    }
    return state;
}

function addRedOktorokAnimations(oktorok: GameObject): void {
    addOktorokIdleAnimations(oktorok);
    addOktorokMovingAnimations(oktorok);
}

function addOktorokIdleAnimations(oktorok: GameObject): void {
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(oktorok, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 }], 1, false));
}

function addOktorokMovingAnimations(oktorok: GameObject): void {
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 60, srcY: 0 },{ srcX: 60, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 30, srcY: 0 },{ srcX: 30, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 0, srcY: 0 },{ srcX: 0, srcY: 30 }], 6, true));
    addAnimation(oktorok, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/enemies.png", getPosition(oktorok), oktorok.width, oktorok.height, [{ srcX: 90, srcY: 0 },{ srcX: 90, srcY: 30 }], 6, true));
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