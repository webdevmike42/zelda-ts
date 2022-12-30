import { getPosition } from "./gameObjects/gameObject.js";
let id = 0;
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
