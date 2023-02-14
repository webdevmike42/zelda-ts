import { createBox, createBoxInFront, NULL_BOX } from "./box.js";
import { getCollidingBoxes } from "./collisions.js";
import { getPosition } from "./gameObjects/gameObject.js";
import { isHurtBoxEnabled } from "./hurtbox.js";
import { removeObjectFromArray } from "./utils.js";
export let hitBoxes = [];
const INVALID_HITBOX_ID = -1;
function createHitBox(position, width, height, owner, damage, enabled = true) {
    const hitBox = Object.assign(Object.assign({}, createBox(position.x, position.y, width, height)), { owner: owner, damage: (damage >= 0 ? damage : 0), enabled: enabled });
    return hitBox;
}
export function setHitBox(gameObject, hitBox) {
    gameObject.hitBox = hitBox;
}
export function spawnHitBoxInFrontOf(gameObject, damage) {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHitBox(box.position, box.width, box.height, gameObject, damage);
    setHitBox(gameObject, hitBox);
    hitBoxes.push(hitBox);
    return hitBox;
}
export function setHitBoxFromBoundingBox(gameObject, damage) {
    const hitBox = createHitBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, damage);
    hitBoxes.push(hitBox);
    setHitBox(gameObject, hitBox);
}
export function removeHitBox(gameObject) {
    if (gameObject.hitBox) {
        removeObjectFromArray(gameObject.hitBox.id, hitBoxes);
        gameObject.hitBox = undefined;
    }
}
export function removeAllHitBoxes() {
    hitBoxes = [];
}
export function setHitBoxesFromGameObjects(gameObjects) {
    hitBoxes = (gameObjects.map((gameObject) => gameObject.hitBox)).filter(hitBox => hitBox !== undefined);
    console.log(hitBoxes);
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
    return (gameObject.hurtBox && isHurtBoxEnabled(gameObject))
        ? getCollidingBoxes(gameObject.hurtBox || Object.assign({}, NULL_BOX), hitBoxes).filter(hb => hb.enabled && hb.owner.id !== gameObject.id)
        : [];
}
