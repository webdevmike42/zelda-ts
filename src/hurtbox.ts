import { Box, createBox, createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { isHitBoxEnabled } from "./hitbox.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

export interface HurtBox extends Box {
    id: number,
    owner: GameObject,
    enabled: boolean
}

export let hurtBoxes: HurtBox[] = [];

export function createHurtBox(position: Vector, width: number, height: number, owner: GameObject, enabled: boolean = true) {
    return {
        ...createBox(position.x, position.y, width, height),
        owner: owner,
        enabled: enabled
    }
}

export function setHurtBoxFromBoundingBox(gameObject: GameObject, enabled: boolean = true): void {
    const hurtBox: HurtBox = createHurtBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, enabled);
    gameObject.hurtBox = hurtBox;
    hurtBoxes.push(hurtBox);
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

export function getCollidingHurtBoxes(gameObject: GameObject): HurtBox[] {
    return (gameObject.hitBox && isHitBoxEnabled(gameObject))
        ? (getCollidingBoxes(gameObject.hitBox || { ...NULL_BOX }, hurtBoxes) as HurtBox[]).filter(hb => hb.enabled && hb.owner.id !== gameObject.id)
        : [];
}

export function removeHurtBox(gameObject:GameObject): void {
    if(gameObject.hurtBox){
        removeObjectFromArray(gameObject.hurtBox.id, hurtBoxes);
        gameObject.hurtBox = undefined;
    }   
}