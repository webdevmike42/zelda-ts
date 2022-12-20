export function createBoxFromVector(position, width, height) {
    return createBox(position.x, position.y, width, height);
}
export function createBox(x, y, width, height) {
    return {
        position: {
            x: x,
            y: y
        },
        width: width,
        height: height
    };
}
