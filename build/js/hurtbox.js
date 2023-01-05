import { getPosition } from "./gameObjects/gameObject.js";
let id = 0;
const NULL_HURTBOX = Object.freeze({});
export function createHurtBox(position, width, height, owner, enabled = true) {
    return {
        id: id++,
        position: Object.assign({}, position),
        width: width,
        height: height,
        owner: owner,
        enabled: enabled
    };
}
/*
export function spawnHitBoxInFrontOf(gameObject: GameObject, damage: number): HurtBox {
    const box = createBoxInFront(gameObject, gameObject.width, gameObject.height);
    const hitBox = createHurtBox(box.position, box.width, box.height, gameObject, damage);
    hurtBoxes.push(hitBox);
    return hitBox;
}
*/
export function setHurtBoxFromBoundingBox(gameObject, enabled = true) {
    const hurtBox = createHurtBox(getPosition(gameObject), gameObject.width, gameObject.height, gameObject, enabled);
    gameObject.hurtBox = hurtBox;
}
export function disableHurtBox(hurtBox) {
    hurtBox.enabled = false;
}
export function enableHurtBox(hurtBox) {
    hurtBox.enabled = true;
}
export function isHurtBoxEnabled(gameObject) {
    var _a;
    return ((_a = gameObject.hurtBox) === null || _a === void 0 ? void 0 : _a.enabled) || false;
}
/*
export function getHurtBox(gameObject:GameObject):HurtBox{
    //return gameObject.hurtBox ? ;
}
*/ 
