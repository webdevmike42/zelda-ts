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
export function normalizedVector(vector) {
    const mag = vectorMagnitude(vector);
    return (mag !== 0)
        ? createVector(vector.x /= mag, vector.y /= mag)
        : vector;
}
export function vectorMagnitude(vector) {
    return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}
export function get4DirectionVector(vector) {
    //8 directions get resolved to x axis
    return createVector(vector.x, (vector.x !== 0) ? 0 : vector.y);
}
export function reverseVector(vector) {
    return vectorScalarProduct(-1, vector);
}
