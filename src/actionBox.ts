import { Box, createBox, createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { GameObject, getPosition } from "./gameObjects/gameObject.js";
import { isHurtBoxEnabled } from "./hurtbox.js";
import { removeObjectFromArray } from "./utils.js";
import { Vector } from "./vector.js";

export interface ActionBox extends Box {
    owner: GameObject,
    enabled: boolean
}

export function createActionbox(position: Vector, width: number, height: number, owner: GameObject, enabled: boolean = true) {
    return {
        ... createBox(position.x, position.y, width, height),
        owner: owner,
        enabled: enabled
    }
}

export function spawnActionboxInFrontOf(gameObject: GameObject): ActionBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const actionbox = createActionbox(box.position, box.width, box.height, gameObject);
    return actionbox;
}

export function setActionboxFromBoundingBox(gameObject: GameObject): void {
    const actionbox: ActionBox = createActionbox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject);
    gameObject.actionBox = actionbox;
}

export function disableActionbox(gameObject: GameObject): void {
    if (gameObject.actionBox)
        gameObject.actionBox.enabled = false;
}
export function enableActionbox(gameObject: GameObject): void {
    if (gameObject.actionBox)
        gameObject.actionBox.enabled = true;
}

export function isActionboxEnabled(gameObject:GameObject):boolean{
    return gameObject.actionBox?.enabled || false;
}