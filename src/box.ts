import { Vector } from "./vector.js";

export interface Box {
    position: Vector,
    width: number,
    height: number
}

export function createBoxFromVector(position: Vector, width: number, height: number) : Box {
    return createBox(position.x,position.y,width,height);
}

export function createBox(x:number, y:number, width: number, height: number) : Box {
    return {
        position: {
            x: x,
            y:y
        },
        width: width,
        height: height
    }
}