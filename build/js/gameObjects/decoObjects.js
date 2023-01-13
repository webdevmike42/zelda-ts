"use strict";
/*
import { GameObject } from "./gameObject.js";

export function createDecoObject(x:number, y:number, width:number, height:number):GameObject {
    const deco = createGameObject(GAME_OBJECT_TYPES.MISC, x, y, width, height, false);
    addVisibilityToGameObject(deco);
    Collisions.addCollisionToGameObject(deco, Collisions.createCollisionDto(deco));
    addAnimationToGameObject(deco, onlyAnimation, true);
    switchGameObjectState(deco, createEmptyState());
    return deco;
}

export function createChest(x: number, y: number, isLocked:boolean = false, isOpen: boolean = false): Chest {
    const chest:Chest = createGameObject(GameObjectType.CHEST) as Chest;
    setPosition(chest, createVector(x, y));
    setBounds(chest, 16, 16);
    setSolid(chest);
    addChestStates(chest);
    addChestAnimations(chest);
    setCollisionBoxFromBoundingBox(chest);
    chest.isOpen = isOpen;
    chest.isLocked = isLocked;
    switchToState(chest, getState(chest, isOpen ? ChestStates.OPEN : ChestStates.CLOSED));
    return chest;
}
*/ 
