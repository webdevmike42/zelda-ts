import { Functor } from "./util/functor.js";

export interface Vector {
    x: number,
    y: number
}

export const NULL_VECTOR = Object.freeze(createVector(0,0));


export function createVector(x: number, y: number) {
    return {
        x: x,
        y: y
    }
}
export function vectorSum(vector1: Vector, vector2: Vector): Vector {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    }
}

export function vectorDiff(vector1: Vector, vector2: Vector): Vector {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    }
}

export function vectorScalarProduct(scalar: number, vector: Vector): Vector {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    }
}

function vectorMagnitude(vector: Vector): number {
    return 0;
}
