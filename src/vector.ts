import { getRandomInt, toRadians } from "./utils.js";

export interface Vector {
    x: number,
    y: number
}

export const NULL_VECTOR = Object.freeze(createVector(0, 0));


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

export function normalizedVector(vector: Vector): Vector {
    const mag = vectorMagnitude(vector);

    return (mag !== 0)
        ? createVector(vector.x /= mag, vector.y /= mag)
        : vector
}

export function vectorMagnitude(vector: Vector): number {
    return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}

export function get4DirectionVector(vector: Vector): Vector {
    //8 directions get resolved to x axis
    return createVector(vector.x, (vector.x !== 0) ? 0 : vector.y)
}

export function reverseVector(vector: Vector): Vector {
    return vectorScalarProduct(-1, vector);
}

export function createRandom4DirectionViewVector(): Vector {
    const directions:number[] = [0,90,180,270];
    const dir:number = directions[getRandomInt(0,directions.length-1)];
    return createVector(Math.round(Math.cos(toRadians(dir))), Math.round(Math.sin(toRadians(dir))));
}