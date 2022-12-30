import { createBoxInFront } from "./box.js";
import { getPosition } from "./gameObjects/gameObject.js";
import { removeObjectFromArray } from "./utils.js";
export let hitBoxes = [];
let id = 0;
export function createHitBox(position, width, height, owner, damage) {
    return {
        id: id++,
        position: Object.assign({}, position),
        width: width,
        height: height,
        owner: owner,
        damage: (damage >= 0 ? damage : 0),
    };
}
export function spawnHitBoxInFrontOf(gameObject, damage) {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHitBox(box.position, box.width, box.height, gameObject, damage);
    hitBoxes.push(hitBox);
    return hitBox;
}
export function setHitBoxFromBoundingBox(gameObject, damage) {
    const hitBox = createHitBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, damage);
    hitBoxes.push(hitBox);
    gameObject.hitBox = hitBox;
}
export function removeHitBox(hitBoxId) {
    removeObjectFromArray(hitBoxId, hitBoxes);
}
export function removeAllHitBoxes() {
    hitBoxes = [];
}
