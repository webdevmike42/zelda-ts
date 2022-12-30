import { Box, createBoxInFront } from "./box.js";
import { GameObject } from "./gameObjects/gameObject.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

export const hitBoxes: HitBox[] = [];
let id: number = 0;

export interface HitBox extends Box {
    id:number,
    owner: GameObject,
    damage: number
}

export function createHitBox(position: Vector, width: number, height: number, owner: GameObject, damage: number) {
    return {
        id: id++,
        position: { ...position },
        width: width,
        height: height,
        owner: owner,
        damage: (damage >= 0 ? damage : 0),
    }
}

export function spawnHitBoxInFrontOf(gameObject: GameObject, damage: number): HitBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHitBox(box.position, box.width, box.height, gameObject, damage);
    hitBoxes.push(hitBox);
    return hitBox;
}

export function removeHitBox(hitBoxId:number):void{
    removeObjectFromArray(hitBoxId, hitBoxes);
}