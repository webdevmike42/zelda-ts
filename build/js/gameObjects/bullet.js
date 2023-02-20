import { addAnimation, createAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { setHitBoxFromBoundingBox } from "../hitbox.js";
import { removeGameObject } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, proposeDesignatedState } from "../state.js";
import { createVector, vectorScalarProduct } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setMovementVector, setPosition, setViewVector } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
export function createBullet(x, y, width, height, owner, damage, speed, viewVector, addDefaultBehavior = true) {
    const bullet = createGameObject(GameObjectType.BULLET);
    setPosition(bullet, createVector(x, y));
    setBounds(bullet, width, height);
    setCollisionBoxFromBoundingBox(bullet);
    setHitBoxFromBoundingBox(bullet, damage);
    setOwner(bullet, owner);
    setSpeed(bullet, speed);
    ignoreConveyor(bullet);
    setViewVector(bullet, viewVector);
    if (addDefaultBehavior) {
        addState(bullet, CommonStateTypes.MOVING, createBulletMovingState(bullet));
        addState(bullet, CommonStateTypes.DEATH, createBulletDeathState(bullet));
        addAnimation(bullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(bullet), bullet.width, bullet.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
        proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.MOVING));
    }
    return bullet;
}
function ignoreConveyor(bullet) {
    bullet.ignoreConveyor = true;
}
function setSpeed(bullet, speed) {
    bullet.speed = speed;
}
function setOwner(bullet, owner) {
    bullet.owner = owner;
}
function createBulletMovingState(bullet) {
    let movementVector = vectorScalarProduct(bullet.speed, bullet.viewVector);
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.name = "bullet default state";
    state.enter = () => {
        //console.log("enter " + state.name)
        setMovementVector(bullet, movementVector);
    };
    state.update = () => {
        if (bullet.hitSolid)
            proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.DEATH));
        else
            setMovementVector(bullet, movementVector);
    };
    return state;
}
export function createBulletDeathState(bullet) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "bullet death state";
    state.enter = () => {
        /*
        setMovementVector(bullet,{...NULL_VECTOR})
        disableHurtBox(bullet);
        disableHitBox(bullet);
        setVisible(bullet, false);
        */
        removeGameObject(bullet);
    };
    return state;
}
