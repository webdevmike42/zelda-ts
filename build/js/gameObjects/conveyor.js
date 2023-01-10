import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentGameObjects } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, switchToState } from "../state.js";
import { createVector, vectorScalarProduct } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
var ConveyorStates;
(function (ConveyorStates) {
    ConveyorStates["ACTIVE"] = "Active";
    ConveyorStates["INACTIVE"] = "Inactive";
})(ConveyorStates || (ConveyorStates = {}));
export function createConveyor(x, y, width, height, conveyingNormalizedDirection, conveyingSpeed, isActive = true) {
    const conveyor = createGameObject(GameObjectType.CONVEYOR);
    setPosition(conveyor, createVector(x, y));
    setBounds(conveyor, width, height);
    setCollisionBoxFromBoundingBox(conveyor);
    addConveyorAnimations(conveyor);
    addConveyorStates(conveyor);
    conveyor.conveyingNormalizedDirection = Object.assign({}, conveyingNormalizedDirection);
    conveyor.conveyingSpeed = conveyingSpeed;
    conveyor.conveyingVector = vectorScalarProduct(conveyingSpeed, conveyingNormalizedDirection);
    conveyor.isActive = isActive;
    switchToState(conveyor, getState(conveyor, isActive ? ConveyorStates.ACTIVE : ConveyorStates.INACTIVE));
    return conveyor;
}
function addConveyorAnimations(conveyor) {
    conveyor.animations = new Map();
    addAnimation(conveyor, createAnimation("active", "./resources/link.png", getPosition(conveyor), conveyor.width, conveyor.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    addAnimation(conveyor, createAnimation("inactive", "./resources/link.png", getPosition(conveyor), conveyor.width, conveyor.height, [{ srcX: 91, srcY: 0 }], 1, false));
}
function addConveyorStates(conveyor) {
    const activeState = createConveyorActiveState(conveyor);
    addState(conveyor, ConveyorStates.ACTIVE, activeState);
    addState(conveyor, ConveyorStates.INACTIVE, createConveyorInactiveState(conveyor));
    setDefaultState(conveyor, activeState);
}
function createConveyorActiveState(conveyor) {
    const state = createEmptyState();
    state.name = "conveyor active state";
    state.type = ConveyorStates.ACTIVE;
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(conveyor, getAnimation(conveyor, "active"));
    };
    state.update = () => {
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
function createConveyorInactiveState(conveyor) {
    const state = createEmptyState();
    state.name = "conveyor inactive state";
    state.type = ConveyorStates.INACTIVE;
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(conveyor, getAnimation(conveyor, "inactive"));
    };
    state.update = () => {
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
function getCollidingConveyors(gameObject) {
    return getCollidingGameObjects(gameObject, getCollisionBox(gameObject), getCurrentGameObjects());
}
export function getCollidingActiveConveyors(gameObject) {
    return getCollidingConveyors(gameObject).filter(conveyor => conveyor.isActive);
}
