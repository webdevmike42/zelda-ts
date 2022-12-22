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
