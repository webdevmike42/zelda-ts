import { GameObject } from "./gameObjects/gameObject.js";
import { NULL_VECTOR, Vector } from "./vector.js";

export interface Box {
    position: Vector,
    width: number,
    height: number
}

export const NULL_BOX = Object.freeze({
    position: Object.freeze({ ...NULL_VECTOR }),
    width: 0,
    height: 0
})

export function createBoxFromVector(position: Vector, width: number, height: number): Box {
    return createBox(position.x, position.y, width, height);
}

export function createBox(x: number, y: number, width: number, height: number): Box {
    return {
        position: {
            x: x,
            y: y
        },
        width: width,
        height: height
    }
}