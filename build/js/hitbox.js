import { createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { getPosition } from "./gameObjects/gameObject.js";
import { removeObjectFromArray } from "./utils.js";
export let hitBoxes = [];
let id = 0;
export function createHitBox(position, width, height, owner, damage, enabled = true) {
    return {
        id: id++,
        position: Object.assign({}, position),
        width: width,
        height: height,
        owner: owner,
        damage: (damage >= 0 ? damage : 0),
        enabled: enabled
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
export function disableHitBox(gameObject) {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = false;
}
export function enableHitBox(gameObject) {
    if (gameObject.hitBox)
        gameObject.hitBox.enabled = true;
}
export function isHitBoxEnabled(gameObject) {
    var _a;
    return ((_a = gameObject.hitBox) === null || _a === void 0 ? void 0 : _a.enabled) || false;
}
export function getCollidingHitBoxes(gameObject) {
    return getCollidingBoxes(gameObject.hurtBox || Object.assign({}, NULL_BOX), hitBoxes).filter(hb => hb.enabled);
}
