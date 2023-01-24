import { addAnimation, createAnimation } from "../animation.js";
import { disableHitBox } from "../hitbox.js";
import { disableHurtBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, proposeDesignatedState } from "../state.js";
import { vectorScalarProduct } from "../vector.js";
import { getPosition, setMovementVector, setViewVector, setVisible } from "./gameObject.js";
import { createDynamicHazard } from "./hazard.js";
export function createBullet(x, y, width, height, owner, damage, speed, viewVector) {
    const bullet = createDynamicHazard(x, y, width, height, 1);
    setOwner(bullet, owner);
    setSpeed(bullet, speed);
    ignoreConveyor(bullet);
    setViewVector(bullet, viewVector);
    addState(bullet, CommonStateTypes.MOVING, createBulletMovingState(bullet));
    addState(bullet, CommonStateTypes.DEATH, createBulletDeathState(bullet));
    addAnimation(bullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(bullet), bullet.width, bullet.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
    console.log("hkjkjhlkjdsfljdkfslkjfdlkjsfd");
    proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.MOVING));
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
    ;
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.enter = () => {
        setMovementVector(bullet, movementVector);
    };
    state.update = () => {
        console.log("BULLET");
        if (bullet.hitSolid)
            proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.DEATH));
        setMovementVector(bullet, movementVector);
    };
    return state;
}
function createBulletDeathState(bullet) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "bullet death state";
    state.enter = () => {
        disableHurtBox(bullet);
        disableHitBox(bullet);
        setVisible(bullet, false);
    };
    return state;
}
