import { createBox, createBoxInFront } from "./box.js";
import { getPosition } from "./gameObjects/gameObject.js";
export function createActionbox(position, width, height, owner, enabled = true) {
    return Object.assign(Object.assign({}, createBox(position.x, position.y, width, height)), { owner: owner, enabled: enabled });
}
export function spawnActionboxInFrontOf(gameObject) {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const actionbox = createActionbox(box.position, box.width, box.height, gameObject);
    return actionbox;
}
export function setActionboxFromBoundingBox(gameObject) {
    const actionbox = createActionbox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject);
    gameObject.actionBox = actionbox;
}
export function disableActionbox(gameObject) {
    if (gameObject.actionBox)
        gameObject.actionBox.enabled = false;
}
export function enableActionbox(gameObject) {
    if (gameObject.actionBox)
        gameObject.actionBox.enabled = true;
}
export function isActionboxEnabled(gameObject) {
    var _a;
    return ((_a = gameObject.actionBox) === null || _a === void 0 ? void 0 : _a.enabled) || false;
}
