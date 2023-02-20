import { Box, createBox, createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { isHurtBoxEnabled } from "./hurtbox.js";
import { removeObjectFromArray } from "./utils.js";
import { NULL_VECTOR, Vector } from "./vector.js";

export let hitBoxes: HitBox[] = [];
const INVALID_HITBOX_ID: number = -1;

export interface HitBox extends Box {
    owner: GameObject,
    damage: number,
    enabled: boolean
}

export function createHitBox(position: Vector, width: number, height: number, owner: GameObject, damage: number, enabled: boolean = true) {
    const hitBox = {
        ...createBox(position.x, position.y, width, height),
        owner: owner,
        damage: (damage >= 0 ? damage : 0),
        enabled: enabled
    }
    return hitBox;
}

function setHitBox(gameObject: GameObject, hitBox: HitBox): void {
    gameObject.hitBox = hitBox;
}

export function spawnHitBoxInFrontOf(gameObject: GameObject, damage: number): HitBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHitBox(box.position, box.width, box.height, gameObject, damage);
    setHitBox(gameObject,hitBox);
    hitBoxes.push(hitBox);
    return hitBox;
}

export function setHitBoxFromBoundingBox(gameObject: GameObject, damage: number): void {
    const hitBox: HitBox = createHitBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, damage);
    hitBoxes.push(hitBox);
    setHitBox(gameObject,hitBox);
}

export function removeHitBox(gameObject:GameObject): void {
    if(gameObject.hitBox){
        removeObjectFromArray(gameObject.hitBox.id, hitBoxes);
        gameObject.hitBox = undefined;
    }   
}

export function removeAllHitBoxes(): void {
    hitBoxes = [];
}

export function setHitBoxesFromGameObjects(gameObjects: GameObject[]): void {
    hitBoxes = ((gameObjects.map((gameObject) => gameObject.hitBox)) as HitBox[]).filter(hitBox => hitBox !== undefined);
    console.log(hitBoxes)
}

export function disableHitBox(gameObject: GameObject): void {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = false;
}
export function enableHitBox(gameObject: GameObject): void {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = true;
}

export function isHitBoxEnabled(gameObject: GameObject): boolean {
    return gameObject.hitBox?.enabled || false;
}

export function getCollidingHitBoxes(gameObject: GameObject, hitBoxesArray:HitBox[] = hitBoxes): HitBox[] {
    return (gameObject.hurtBox && isHurtBoxEnabled(gameObject))
        ? (getCollidingBoxes(gameObject.hurtBox || { ...NULL_BOX }, hitBoxesArray) as HitBox[]).filter(hb => hb.enabled && hb.owner.id !== gameObject.id)
        : [];
}