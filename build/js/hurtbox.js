import { createBox } from "./box.js";
import { getPosition } from "./gameObjects/gameObject.js";
function createHurtBox(position, width, height, owner, enabled = true) {
    return Object.assign(Object.assign({}, createBox(position.x, position.y, width, height)), { owner: owner, enabled: enabled });
}
export function setHurtBoxFromBoundingBox(gameObject, enabled = true) {
    const hurtBox = createHurtBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, enabled);
    gameObject.hurtBox = hurtBox;
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
