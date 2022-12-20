export const NULL_VECTOR = Object.freeze(createVector(0, 0));
export function createVector(x, y) {
    return {
        x: x,
        y: y
    };
}
export function vectorSum(vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
    };
}
export function vectorDiff(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    };
}
export function vectorScalarProduct(scalar, vector) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
}
function vectorMagnitude(vector) {
    return 0;
}
