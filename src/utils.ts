import { MS_PER_SECOND } from "./Global.js";

export const pipe = function<I,O>(...fns: Function[]) {
    return function (val:I){
        return fns.reduce(
            (prev, fn) => {
                return fn(prev)
            },
            val
        ) as unknown as O;
    }
};

export const compose = function <I,O>(...fns: Function[]) {
    return function (val: I) {
        return fns.reduceRight(
            (prev, fn) => {
                return fn(prev)
            },
            val
        ) as unknown as O;
    }
};

export function readyForNextFrame(currentTime: number, timeOfLastTick: number, fps: number) {
    return ((currentTime - timeOfLastTick) >= (MS_PER_SECOND / fps))
}

export function getVectorFrameFraction(vector: Vector, timeSinceLastTick: number): Vector {
    return {
        x: vector.x * (timeSinceLastTick / MS_PER_SECOND),
        y: vector.y * (timeSinceLastTick / MS_PER_SECOND)
    }
}