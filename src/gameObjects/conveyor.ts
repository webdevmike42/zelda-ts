import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, State, switchToState } from "../state.js";
import { createVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";

interface Conveyor extends GameObject {
    isActive:boolean,
    conveyingNormalizedDirection: Vector,
    conveyingSpeed: number,
    conveyingVector: Vector
}

enum ConveyorStates {
    ACTIVE = "Active",
    INACTIVE = "Inactive"
}

export function createConveyor(x: number, y: number, width: number, height: number, conveyingNormalizedDirection: Vector, conveyingSpeed: number, isActive = true): Conveyor {
    const conveyor: Conveyor = createGameObject(GameObjectType.CONVEYOR) as Conveyor;
    setPosition(conveyor, createVector(x, y));
    setBounds(conveyor, width, height);
    setCollisionBoxFromBoundingBox(conveyor);
    addConveyorAnimations(conveyor);
    addConveyorStates(conveyor);

    conveyor.conveyingNormalizedDirection = { ...conveyingNormalizedDirection };
    conveyor.conveyingSpeed = conveyingSpeed;
    conveyor.conveyingVector = vectorScalarProduct(conveyingSpeed, conveyingNormalizedDirection);
    conveyor.isActive = isActive;
    switchToState(conveyor, getState(conveyor, isActive ? ConveyorStates.ACTIVE : ConveyorStates.INACTIVE));

    return conveyor;
}

function addConveyorAnimations(conveyor: Conveyor): void {
    conveyor.animations = new Map<string, Animation>();
    addAnimation(conveyor, createAnimation("active", "./resources/link.png", getPosition(conveyor), conveyor.width, conveyor.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    addAnimation(conveyor, createAnimation("inactive", "./resources/link.png", getPosition(conveyor), conveyor.width, conveyor.height, [{ srcX: 91, srcY: 0 }], 1, false));
}

function addConveyorStates(conveyor: Conveyor): void {
    const activeState: State = createConveyorActiveState(conveyor);
    addState(conveyor, ConveyorStates.ACTIVE, activeState);
    addState(conveyor, ConveyorStates.INACTIVE, createConveyorInactiveState(conveyor));
    setDefaultState(conveyor, activeState);
}

function createConveyorActiveState(conveyor: Conveyor): State {
    const state: State = createEmptyState();
    state.name = "conveyor active state";
    state.type = ConveyorStates.ACTIVE;
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(conveyor, getAnimation(conveyor, "active"));
    }
    state.update = () => {
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function createConveyorInactiveState(conveyor: Conveyor): State {
    const state: State = createEmptyState();
    state.name = "conveyor inactive state";
    state.type = ConveyorStates.INACTIVE;
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(conveyor, getAnimation(conveyor, "inactive"));
    }
    state.update = () => {
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

function getCollidingConveyors(gameObject:GameObject):Conveyor[]{
    return getCollidingGameObjects(gameObject,getCollisionBox(gameObject),getCurrentGameObjects()) as Conveyor[];
}

export function getCollidingActiveConveyors(gameObject:GameObject):Conveyor[]{
    return getCollidingConveyors(gameObject).filter(conveyor => conveyor.isActive);
}

export function getConveyingVectorSum(conveyors:Conveyor[]):Vector{
    return conveyors.reduce((resultVector, conveyor) => vectorSum(resultVector,conveyor.conveyingVector),{...NULL_VECTOR});
}