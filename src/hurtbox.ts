import { Box, createBox, createBoxInFront } from "./box.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

export interface HurtBox extends Box {
    id: number,
    owner: GameObject,
    enabled: boolean
}

const NULL_HURTBOX = Object.freeze({

})

export function createHurtBox(position: Vector, width: number, height: number, owner: GameObject, enabled: boolean = true) {
    return {
        ...createBox(position.x, position.y, width, height),
        owner: owner,
        enabled: enabled
    }
}
/*
export function spawnHitBoxInFrontOf(gameObject: GameObject, damage: number): HurtBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHurtBox(box.position, box.width, box.height, gameObject, damage);
    hurtBoxes.push(hitBox);
    return hitBox;
}
*/

export function setHurtBoxFromBoundingBox(gameObject: GameObject, enabled: boolean = true): void {
    const hurtBox: HurtBox = createHurtBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, enabled);
    gameObject.hurtBox = hurtBox;
}

export function disableHurtBox(gameObject: GameObject): void {
    setHurtBoxEnabled(gameObject.hurtBox, false);
}

export function enableHurtBox(gameObject: GameObject): void {
    setHurtBoxEnabled(gameObject.hurtBox, true);
}

function setHurtBoxEnabled(hurtBox: HurtBox | undefined, isEnabled: boolean): void {
    if(hurtBox !== undefined)
        hurtBox.enabled = isEnabled;
}

export function isHurtBoxEnabled(gameObject: GameObject): boolean {
    return gameObject.hurtBox?.enabled || false;
}

/*
export function getHurtBox(gameObject:GameObject):HurtBox{
    //return gameObject.hurtBox ? ;
}
*/