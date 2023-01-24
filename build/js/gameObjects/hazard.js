import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, proposeDesignatedState } from "../state.js";
import { createVector, reverseVector } from "../vector.js";
import { GameObjectType, getPosition, isGameObjectDead, setBounds, setHealth, setMaxHealth, setMovementVector, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
export function createStaticHazard(x, y, width, height, damage) {
    const staticHazard = createGameObject(GameObjectType.HAZARD);
    staticHazard.name = "static hazard";
    setPosition(staticHazard, createVector(x, y));
    setBounds(staticHazard, width, height);
    setCollisionBoxFromBoundingBox(staticHazard);
    setHitBoxFromBoundingBox(staticHazard, damage);
    addAnimation(staticHazard, createAnimation("StaticHazardActive", "./resources/link.png", getPosition(staticHazard), staticHazard.width, staticHazard.height, [{ srcX: 180, srcY: 151 }], 1, false));
    setCurrentAnimation(staticHazard, getAnimation(staticHazard, "StaticHazardActive"));
    console.dir("createStaticHazard");
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
    const state = createEmptyState(CommonStateTypes.HIT);
    let hitBox;
    state.name = "hazard hit state";
    state.init = (hitBoxArg) => {
        hitBox = hitBoxArg;
    };
    state.enter = () => {
        if (hazard.health) {
            hazard.health -= hitBox.damage;
        }
    };
    state.update = () => {
        if (isGameObjectDead(hazard)) {
            proposeDesignatedState(hazard, getState(hazard, CommonStateTypes.DEATH));
        }
    };
    return state;
}
function createDestroyableStaticHazardDeathState(hazard) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "hazard death state";
    state.enter = () => {
        disableHurtBox(hazard);
        disableHitBox(hazard);
    };
    return state;
}
export function createDynamicHazard(x, y, width, height, damage) {
    const hazard = createStaticHazard(x, y, width, height, damage);
    hazard.name = "dynamic hazard";
    setPosition(hazard, createVector(x, y));
    setBounds(hazard, width, height);
    setCollisionBoxFromBoundingBox(hazard);
    setHitBoxFromBoundingBox(hazard, damage);
    addAnimation(hazard, createAnimation("hazardActive", "./resources/link.png", getPosition(hazard), hazard.width, hazard.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
    addDynamicHazardStates(hazard);
    //addDynamicHazardAnimations(hazard);
    //switchToState(hazard, getState(hazard, CommonStateTypes.MOVING));
    proposeDesignatedState(hazard, getState(hazard, CommonStateTypes.MOVING));
    return hazard;
}
function addDynamicHazardStates(hazard) {
    addState(hazard, CommonStateTypes.MOVING, createDynamicHazardMovingState(hazard));
}
function createDynamicHazardMovingState(hazard) {
    let movementVector = createVector(-100, 0);
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.update = (currentGameTime, timeSinceLastTick) => {
        if (hazard.hitSolid) {
            movementVector = reverseVector(movementVector);
        }
        setMovementVector(hazard, movementVector);
    };
    return state;
}
function addDynamicHazardAnimations(hazard) {
    addAnimation(hazard, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(hazard), hazard.width, hazard.height, [{ srcX: 62, srcY: 0 }], 1, false), true);
}
