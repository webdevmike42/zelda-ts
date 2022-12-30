import { createBoxInFront } from "./box.js";
import { removeObjectFromArray } from "./utils.js";
export const hitBoxes = [];
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
export function removeHitBox(hitBoxId) {
    removeObjectFromArray(hitBoxId, hitBoxes);
}
