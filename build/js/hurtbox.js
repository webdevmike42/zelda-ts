import { createBox, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { getPosition } from "./gameObjects/gameObject.js";
import { isHitBoxEnabled } from "./hitbox.js";
import { removeObjectFromArray } from "./utils.js";
export let hurtBoxes = [];
export function createHurtBox(position, width, height, owner, enabled = true) {
    return Object.assign(Object.assign({}, createBox(position.x, position.y, width, height)), { owner: owner, enabled: enabled });
}
export function setHurtBoxFromBoundingBox(gameObject, enabled = true) {
    const hurtBox = createHurtBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, enabled);
    gameObject.hurtBox = hurtBox;
    hurtBoxes.push(hurtBox);
}
export function disableHurtBox(gameObject) {
    setHurtBoxEnabled(gameObject.hurtBox, false);
}
export function enableHurtBox(gameObject) {
    setHurtBoxEnabled(gameObject.hurtBox, true);
}
function setHurtBoxEnabled(hurtBox, isEnabled) {
    if (hurtBox !== undefined)
        hurtBox.enabled = isEnabled;
}
export function isHurtBoxEnabled(gameObject) {
    var _a;
    return ((_a = gameObject.hurtBox) === null || _a === void 0 ? void 0 : _a.enabled) || false;
}
export function getCollidingHurtBoxes(gameObject) {
    return (gameObject.hitBox && isHitBoxEnabled(gameObject))
        ? getCollidingBoxes(gameObject.hitBox || Object.assign({}, NULL_BOX), hurtBoxes).filter(hb => hb.enabled && hb.owner.id !== gameObject.id)
        : [];
}
export function removeHurtBox(gameObject) {
    if (gameObject.hurtBox) {
        removeObjectFromArray(gameObject.hurtBox.id, hurtBoxes);
        gameObject.hurtBox = undefined;
    }
}
