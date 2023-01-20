import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { EMPTY_SCREEN_ID, getCurrentGameObjects, switchToScreen } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, proposeDesignatedState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject, setSolid } from "./gameObjectFactory.js";

export interface Door extends GameObject{
    isOpen:boolean
}

enum DoorStates {
    OPEN = "Open",
    CLOSED = "Closed"
};

export function createDoor(x: number, y: number, width: number, height: number, isOpen: boolean): Door {
    const door:Door = createGameObject(GameObjectType.DOOR) as Door;
    console.log("createDoor")
    setPosition(door, createVector(x, y));
    setBounds(door, width, height);
    setSolid(door,!isOpen);
    addDoorStates(door);
    addDoorAnimations(door);
    setCollisionBoxFromBoundingBox(door);
    door.isOpen = isOpen;
    switchToState(door, getState(door, isOpen ? DoorStates.OPEN : DoorStates.CLOSED));
    return door;
}

function addDoorStates(door: Door): void {
    const closedState: State = createDoorClosedState(door);
    addState(door, DoorStates.OPEN, createDoorOpenState(door));
    addState(door, DoorStates.CLOSED, closedState);
    setDefaultState(door, closedState);
}

function addDoorAnimations(door: Door): void {
    door.animations = new Map<string, Animation>();
    addAnimation(door, createAnimation(DoorStates.OPEN, "./resources/link.png", getPosition(door), door.width, door.height, [{ srcX: 91, srcY: 0 }], 1, false));
    addAnimation(door, createAnimation(DoorStates.CLOSED, "./resources/link.png", getPosition(door), door.width, door.height, [{ srcX: 30, srcY: 0 }], 1, false));
}

function createDoorOpenState(door: Door): State {
    const state: State = createEmptyState(DoorStates.OPEN);
    state.name = "door open state";
    state.enter = () => {
        setCurrentAnimation(door, getAnimation(door, DoorStates.OPEN));
        setSolid(door,false);
    }
    state.update = () => {
        
    }
    state.exit = () => {
    };
    return state;
}

function createDoorClosedState(door: Door): State {
    const state: State = createEmptyState(DoorStates.CLOSED);
    state.name = "door closed state";
    state.enter = () => {
        setCurrentAnimation(door, getAnimation(door, DoorStates.CLOSED));
        setSolid(door,true);
    }
    state.update = () => {
        
    }
    state.exit = () => {
    };
    return state;
}


export function openDoor(door:Door):void{
    proposeDesignatedState(door,getState(door, DoorStates.OPEN));
}

export function closeDoor(door:Door):void{
    proposeDesignatedState(door,getState(door, DoorStates.CLOSED));
}