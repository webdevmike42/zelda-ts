import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, setDesignatedState, switchToState } from "../state.js";
import { createVector, reverseVector } from "../vector.js";
import { GameObjectType, getPosition, isGameObjectDead, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
export function createStaticHazard(x, y, width, height, damage) {
    const staticHazard = createGameObject(GameObjectType.HAZARD);
    setPosition(staticHazard, createVector(x, y));
    setBounds(staticHazard, width, height);
    setCollisionBoxFromBoundingBox(staticHazard);
    setHitBoxFromBoundingBox(staticHazard, damage);
    addAnimation(staticHazard, createAnimation("StaticHazardActive", "./resources/link.png", getPosition(staticHazard), staticHazard.width, staticHazard.height, [{ srcX: 180, srcY: 151 }], 1, false));
    setCurrentAnimation(staticHazard, getAnimation(staticHazard, "StaticHazardActive"));
    return staticHazard;
}
export function createDestroyableStaticHazard(x, y, width, height, damage, health) {
    const hazard = createStaticHazard(x, y, width, height, damage);
    setHurtBoxFromBoundingBox(hazard);
    setHealth(hazard, health);
    setMaxHealth(hazard, health);
    addDestroyableHazardStates(hazard);
    return hazard;
}
function addDestroyableHazardStates(hazard) {
    const hitState = createDestroyableStaticHazardHitState(hazard);
    addState(hazard, CommonStateTypes.HIT, hitState);
    addState(hazard, CommonStateTypes.DEATH, createDestroyableStaticHazardDeathState(hazard));
    setDefaultState(hazard, hitState);
}
function createDestroyableStaticHazardHitState(hazard) {
    const state = createEmptyState();
    state.type = CommonStateTypes.HIT;
    state.name = "hazard hit state";
    state.enter = () => {
        console.log("enter hazard hit state");
        console.log(hazard.health);
        const hitBox = hazard.stateArgs[0];
        if (hazard.health) {
            hazard.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(hazard)) {
            console.log("MUH");
            setDesignatedState(hazard, getState(hazard, CommonStateTypes.DEATH));
        }
    };
    return state;
}
function createDestroyableStaticHazardDeathState(hazard) {
    const state = createEmptyState();
    state.type = CommonStateTypes.DEATH;
    state.name = "hazard death state";
    state.enter = () => {
        console.log("enter hazard death state");
        disableHurtBox(hazard);
        disableHitBox(hazard);
    };
    return state;
}
export function createDynamicHazard(x, y, width, height, damage) {
    const hazard = createStaticHazard(x, y, width, height, damage);
    addDynamicHazardStates(hazard);
    addDynamicHazardAnimations(hazard);
    switchToState(hazard, getState(hazard, CommonStateTypes.MOVING));
    return hazard;
}
function addDynamicHazardStates(hazard) {
    addState(hazard, CommonStateTypes.MOVING, createDynamicHazardMovingState(hazard));
}
function createDynamicHazardMovingState(hazard) {
    let startTime = -1, durationInMs = 500; //, movingSpeed: number = 200;
    let movementVector = createVector(100, 0);
    const state = createEmptyState();
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (startTime === -1) {
            startTime = currentGameTime;
        }
        //if ((currentGameTime - startTime) >= durationInMs) {
        if (hazard.hitSolid) {
            movementVector = reverseVector(movementVector);
            startTime = currentGameTime;
        }
        setMovementVector(hazard, movementVector);
    };
    return state;
}
function addDynamicHazardAnimations(hazard) {
    addAnimation(hazard, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(hazard), hazard.width, hazard.height, [{ srcX: 62, srcY: 0 }], 1, false), true);
}
