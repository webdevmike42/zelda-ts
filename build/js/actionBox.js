import { createBox } from "./box.js";
export function createActionbox(position, width, height, owner, enabled = true) {
    return Object.assign(Object.assign({}, createBox(position.x, position.y, width, height)), { owner: owner, enabled: enabled });
}
/*
export function spawnActionboxInFrontOf(gameObject: GameObject): ActionBox {
    console.log(getViewVector(gameObject))
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const actionbox = createActionbox(box.position, box.width, box.height, gameObject);
    gameObject.actionBox = actionbox;
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
*/ 
