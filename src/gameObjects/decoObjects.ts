import { addAnimation, createAnimation, createTextAnimation } from "../animation.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";

function createDecoObject(x: number, y: number, width: number, height: number): GameObject {
    const deco: GameObject = createGameObject(GameObjectType.MISC);
    setPosition(deco, createVector(x, y));
    setBounds(deco, width, height);
    return deco;
}

export function createFlame(x: number, y: number): GameObject {
    const flame: GameObject = createDecoObject(x, y, 16, 16);
    addAnimation(flame, createAnimation("deco", "./resources/chars.png", getPosition(flame), flame.width, flame.height, [{ srcX: 51, srcY: 11 }, { srcX: 158, srcY: 105 }], 15, true), true);
    return flame;
}

export function createOldMan(x: number, y: number): GameObject {
    const oldMan: GameObject = createDecoObject(x, y, 16, 16);
    addAnimation(oldMan, createAnimation("deco", "./resources/chars.png", getPosition(oldMan), oldMan.width, oldMan.height, [{ srcX: 1, srcY: 11 }], 1, false), true);
    return oldMan;
}

export function createCaveText(x: number, y: number): GameObject {
    const caveText: GameObject = createDecoObject(x, y, 16, 16);
    addAnimation(caveText, createTextAnimation("caveText", "IT'S DANGEROUS TO GO ALONE! TAKE THIS.", "white", "8px Arial", createVector(x, y), caveText.width, caveText.height, 12, false),true);
    return caveText;
}