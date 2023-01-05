import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, setDefaultState, setDesignatedState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, isGameObjectDead, setBounds, setHealth, setMaxHealth, setPosition } from "./gameObject.js";
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
        if (hazard.hurtBox)
            disableHurtBox(hazard.hurtBox);
        disableHitBox(hazard);
    };
    return state;
}
