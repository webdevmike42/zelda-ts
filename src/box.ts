import { GameObject, getBoundingBox, getCenter, getPosition, getViewVector } from "./gameObjects/gameObject.js";
import { NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "./vector.js";

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

export function createBoxInFront(gameObject: GameObject, width: number, height: number): Box {
    const position: Vector = getPosition(gameObject);
    const viewVector:Vector = getViewVector(gameObject);
    const offsetX: number = viewVector.x * ((viewVector.x === 1) ? gameObject.width : width);
    const offsetY: number = viewVector.y * ((viewVector.y === 1) ? gameObject.height : height);
    
    return createBox(position.x + offsetX, position.y + offsetY, width, height);
}