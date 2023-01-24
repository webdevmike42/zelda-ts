import { addAnimation, createAnimation } from "../animation.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox } from "../hurtbox.js";
import { addState, CommonStateTypes, createEmptyState, getState, proposeDesignatedState, State } from "../state.js";
import { createVector, Vector, vectorScalarProduct } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setMovementVector, setPosition, setViewVector, setVisible } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
import { createDynamicHazard } from "./hazard.js";

export interface Bullet extends GameObject {
    owner: GameObject,
    speed: number
}

export function createBullet(x: number, y: number, width: number, height: number, owner: GameObject, damage: number, speed: number, viewVector:Vector) {
    const bullet: Bullet = createDynamicHazard(x, y, width, height, 1) as Bullet;
    setOwner(bullet, owner);
    setSpeed(bullet, speed);
    ignoreConveyor(bullet);
    setViewVector(bullet, viewVector);
    addState(bullet, CommonStateTypes.MOVING, createBulletMovingState(bullet));
    addState(bullet, CommonStateTypes.DEATH, createBulletDeathState(bullet));
    addAnimation(bullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(bullet), bullet.width, bullet.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
console.log("hkjkjhlkjdsfljdkfslkjfdlkjsfd")
    proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.MOVING))
    return bullet;
}

function ignoreConveyor(bullet: Bullet) {
    bullet.ignoreConveyor = true;
}

function setSpeed(bullet: Bullet, speed: number): void {
    bullet.speed = speed;
}

function setOwner(bullet: Bullet, owner: GameObject): void {
    bullet.owner = owner;
}

function createBulletMovingState(bullet: Bullet): State {
    let movementVector = vectorScalarProduct(bullet.speed,bullet.viewVector);;

    const state = createEmptyState(CommonStateTypes.MOVING);
    state.enter = () => {

        setMovementVector(bullet, movementVector);
    }
    state.update = () => {
        console.log("BULLET")
        if (bullet.hitSolid)
            proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.DEATH));
        setMovementVector(bullet, movementVector);
    }
    return state;
}

function createBulletDeathState(bullet: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
    state.name = "bullet death state";

    state.enter = () => {
        disableHurtBox(bullet);
        disableHitBox(bullet);
        setVisible(bullet, false);
    };
    return state;
}
