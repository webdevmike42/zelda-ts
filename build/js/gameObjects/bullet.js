import { addAnimation, createAnimation } from "../animation.js";
import { disableHitBox } from "../hitbox.js";
import { disableHurtBox } from "../hurtbox.js";
import { removeGameObject } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, proposeDesignatedState } from "../state.js";
import { NULL_VECTOR, vectorScalarProduct } from "../vector.js";
import { GameObjectType, getPosition, setMovementVector, setViewVector, setVisible } from "./gameObject.js";
import { createDynamicHazard } from "./hazard.js";
export function createBullet(x, y, width, height, owner, damage, speed, viewVector) {
    const bullet = createDynamicHazard(x, y, width, height, 1);
    bullet.type = GameObjectType.BULLET;
    setOwner(bullet, owner);
    setSpeed(bullet, speed);
    ignoreConveyor(bullet);
    setViewVector(bullet, viewVector);
    addState(bullet, CommonStateTypes.MOVING, createBulletMovingState(bullet));
    addState(bullet, CommonStateTypes.DEATH, createBulletDeathState(bullet));
    addAnimation(bullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(bullet), bullet.width, bullet.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
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
        if (bullet.hitSolid)
            proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.DEATH));
        else
            setMovementVector(bullet, movementVector);
    };
    return state;
}
function createBulletDeathState(bullet) {
    const state = createEmptyState(CommonStateTypes.DEATH);
    state.name = "bullet death state";
    state.enter = () => {
        setMovementVector(bullet, Object.assign({}, NULL_VECTOR));
        disableHurtBox(bullet);
        disableHitBox(bullet);
        setVisible(bullet, false);
        removeGameObject(bullet);
    };
    return state;
}
