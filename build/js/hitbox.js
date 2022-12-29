export function createHitBox(position, width, height, owner, damage = 1) {
    return {
        position: Object.assign({}, position),
        width: width,
        height: height,
        owner: owner,
        damage: damage,
    };
}
