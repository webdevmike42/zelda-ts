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
