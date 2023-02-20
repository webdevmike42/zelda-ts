import { addAnimation, createAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { disableHitBox, setHitBoxFromBoundingBox } from "../hitbox.js";
import { disableHurtBox } from "../hurtbox.js";
import { removeGameObject } from "../screens.js";
import { addState, CommonStateTypes, createEmptyState, getState, proposeDesignatedState, State } from "../state.js";
import { createVector, NULL_VECTOR, Vector, vectorScalarProduct } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setMovementVector, setPosition, setViewVector, setVisible } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
import { createDynamicHazard } from "./hazard.js";

export interface Bullet extends GameObject {
    owner: GameObject,
    speed: number
}

export function createBullet(x: number, y: number, width: number, height: number, owner: GameObject, damage: number, speed: number, viewVector: Vector, addDefaultBehavior:boolean = true) {
    const bullet: Bullet = createGameObject(GameObjectType.BULLET) as Bullet;
    
    setPosition(bullet, createVector(x, y));
    setBounds(bullet, width, height);
    setCollisionBoxFromBoundingBox(bullet);
    setHitBoxFromBoundingBox(bullet, damage);
    setOwner(bullet, owner);
    setSpeed(bullet, speed);
    ignoreConveyor(bullet);
    setViewVector(bullet, viewVector);

    if(addDefaultBehavior){
        addState(bullet, CommonStateTypes.MOVING, createBulletMovingState(bullet));
        addState(bullet, CommonStateTypes.DEATH, createBulletDeathState(bullet));
        addAnimation(bullet, createAnimation(CommonStateTypes.MOVING, "./resources/link.png", getPosition(bullet), bullet.width, bullet.height, [{ srcX: 195, srcY: 160 }], 1, false), true);
        proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.MOVING))
    }
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
    let movementVector = vectorScalarProduct(bullet.speed, bullet.viewVector);
    
    const state = createEmptyState(CommonStateTypes.MOVING);
    state.name = "bullet default state"
    state.enter = () => {
        //console.log("enter " + state.name)
        setMovementVector(bullet, movementVector);
    }
    state.update = () => {
        if (bullet.hitSolid)
            proposeDesignatedState(bullet, getState(bullet, CommonStateTypes.DEATH));

        else
            setMovementVector(bullet, movementVector);
    }
    return state;
}

export function createBulletDeathState(bullet: GameObject): State {
    const state: State = createEmptyState(CommonStateTypes.DEATH);
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
