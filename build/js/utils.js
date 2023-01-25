import { MS_PER_SECOND } from "./Global.js";
export const pipe = function (...fns) {
    return function (val) {
        return fns.reduce((prev, fn) => {
            return fn(prev);
        }, val);
    };
};
export const compose = function (...fns) {
    return function (val) {
        return fns.reduceRight((prev, fn) => {
            return fn(prev);
        }, val);
    };
};
export function readyForNextFrame(currentTime, timeOfLastTick, fps) {
    return ((currentTime - timeOfLastTick) >= (MS_PER_SECOND / fps));
}
export function getVectorFrameFraction(vector, timeSinceLastTick) {
    return {
        x: vector.x * (timeSinceLastTick / MS_PER_SECOND),
        y: vector.y * (timeSinceLastTick / MS_PER_SECOND)
    };
}
export function removeObjectFromArray(objectId, arr) {
    if (!arr)
        return;
    arr.splice(arr.map(obj => obj.id).indexOf(objectId), 1);
}
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
