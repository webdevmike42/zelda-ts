import { Box } from "./box.js";
import { GameObject } from "./gameObjects/gameObject.js";
import { Vector } from "./vector.js";

export interface HitBox extends Box {
    owner: GameObject,
    damage: number
}

export function createHitBox(position: Vector, width: number, height: number, owner: GameObject, damage:number = 1) {
    return {
        position: { ...position },
        width: width,
        height: height,
        owner: owner,
        damage: damage,
    }
}