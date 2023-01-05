import { Box, createBox, createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { isHurtBoxEnabled } from "./hurtbox.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

export let hitBoxes: HitBox[] = [];

export interface HitBox extends Box {
    owner: GameObject,
    damage: number,
    enabled: boolean
}

export function createHitBox(position: Vector, width: number, height: number, owner: GameObject, damage: number, enabled: boolean = true) {
    return {
        ... createBox(position.x, position.y, width, height),
        owner: owner,
        damage: (damage >= 0 ? damage : 0),
        enabled: enabled
    }
}

export function spawnHitBoxInFrontOf(gameObject: GameObject, damage: number): HitBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHitBox(box.position, box.width, box.height, gameObject, damage);
    hitBoxes.push(hitBox);
    return hitBox;
}

export function setHitBoxFromBoundingBox(gameObject: GameObject, damage: number): void {
    const hitBox: HitBox = createHitBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, damage);
    hitBoxes.push(hitBox);
    gameObject.hitBox = hitBox;
}
export function removeHitBox(hitBoxId: number): void {
    removeObjectFromArray(hitBoxId, hitBoxes);
}

export function removeAllHitBoxes(): void {
    hitBoxes = [];
}

export function disableHitBox(gameObject: GameObject): void {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = false;
}
export function enableHitBox(gameObject: GameObject): void {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = true;
}

export function isHitBoxEnabled(gameObject:GameObject):boolean{
    return gameObject.hitBox?.enabled || false;
}

export function getCollidingHitBoxes(gameObject: GameObject): HitBox[] {
    return (gameObject.hurtBox && isHurtBoxEnabled(gameObject))
    ? (getCollidingBoxes(gameObject.hurtBox || { ...NULL_BOX }, hitBoxes) as HitBox[]).filter(hb => hb.enabled && hb.owner.id !== gameObject.id)
    : [];
}

