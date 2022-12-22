import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { switchToScreen } from "../screens.js";
import { addState, CommonStates, createEmptyState, getState, setDefaultState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { addGameObject, filterGameObjects, getGameObjects } from "./gameObjectFactory.js";

export interface Teleporter extends GameObject {
    targetScreenId: number,
    targetX: number,
    targetY: number
}

enum TeleporterStates {
    ACTIVE = "active"
}

export function createTeleporter(x: number, y: number, width: number, height: number): Teleporter {
    const teleporter: Teleporter = addGameObject(GameObjectType.TELEPORTER) as Teleporter;
    setPosition(teleporter, createVector(x, y));
    setBounds(teleporter, width, height);
    addTeleporterStates(teleporter);
    addTeleporterAnimations(teleporter);
    setCollisionBoxFromBoundingBox(teleporter);
    setTarget(teleporter, 119, 100, 180);
    switchToState(teleporter, getState(teleporter, TeleporterStates.ACTIVE));
    return teleporter;
}

export function setTarget(teleporter: Teleporter, targetScreenId: number, targetX: number, targetY: number): void {
    teleporter.targetScreenId = targetScreenId;
    teleporter.targetX = targetX;
    teleporter.targetY = targetY;
}

function addTeleporterStates(teleporter: Teleporter): void {
    const activeState: State = createTeleporterActiveState(teleporter);
    addState(teleporter, TeleporterStates.ACTIVE, activeState);
    setDefaultState(teleporter, activeState);
}

function addTeleporterAnimations(teleporter: Teleporter): void {
    teleporter.animations = new Map<string, Animation>();
    addAnimation(teleporter, createAnimation("TeleporterActive", "./resources/link.png", getPosition(teleporter), teleporter.width, teleporter.height, [{ srcX: 0, srcY: 0 }], 1, false));
    setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
}

function createTeleporterActiveState(teleporter: Teleporter): State {
    const state: State = createEmptyState();
    state.name = "teleporter active state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
    }
    state.update = () => {
        getCollidingGameObjects(teleporter, getCollisionBox(teleporter), filterGameObjects(GameObjectType.PLAYER, getGameObjects()))
            .forEach(gameObject => {
                teleport(gameObject, teleporter.targetScreenId, teleporter.targetX, teleporter.targetY);
            });
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

export function teleport(gameObject: GameObject, targetScreenId: number, targetX: number, targetY: number) {
    switchToScreen(targetScreenId);
    setGameObjectPosition(gameObject, createVector(targetX, targetY));
}