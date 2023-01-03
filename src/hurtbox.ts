import { Box, createBoxInFront } from "./box.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

let id: number = 0;

export interface HurtBox extends Box {
    id: number,
    owner: GameObject,
    enabled: boolean
}

export function createHurtBox(position: Vector, width: number, height: number, owner: GameObject, enabled: boolean = true) {
    return {
        id: id++,
        position: { ...position },
        width: width,
        height: height,
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

export function disableHurtBox(hurtBox:HurtBox):void{
    hurtBox.enabled = false;
}
export function enableHurtBox(hurtBox:HurtBox):void{
    hurtBox.enabled = true;
}