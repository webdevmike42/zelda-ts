import { getPosition, getViewVector } from "./gameObjects/gameObject.js";
import { NULL_VECTOR } from "./vector.js";
export const NULL_BOX = Object.freeze({
    position: Object.freeze(Object.assign({}, NULL_VECTOR)),
    width: 0,
    height: 0
});
export function createBoxFromVector(position, width, height) {
    return createBox(position.x, position.y, width, height);
}
export function createBox(x, y, width, height) {
    return {
        position: {
            x: x,
            y: y
        },
        width: width,
        height: height
    };
}
export function createBoxInFront(gameObject, width, height) {
    const position = getPosition(gameObject);
    const viewVector = getViewVector(gameObject);
    const offsetX = viewVector.x * ((viewVector.x === 1) ? gameObject.width : width);
    const offsetY = viewVector.y * ((viewVector.y === 1) ? gameObject.height : height);
    return createBox(position.x + offsetX, position.y + offsetY, width, height);
}
