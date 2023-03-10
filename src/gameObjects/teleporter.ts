import { addAnimation, Animation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { EMPTY_SCREEN_ID, getCurrentGameObjects, switchToScreen } from "../screens.js";
import { addState, createEmptyState, getState, proposeDesignatedState, setDefaultState, State, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObject, GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject, filterGameObjects } from "./gameObjectFactory.js";

export interface Teleporter extends GameObject {
    targetScreenId: number,
    targetX: number | undefined,
    targetY: number | undefined
}

enum TeleporterStates {
    ACTIVE = "active"
}

export function createTeleporterTrigger(x: number, y: number, width: number, height: number, targetScreenId?: number, targetX?: number, targetY?: number): Teleporter {
    const teleporter: Teleporter = createGameObject(GameObjectType.TELEPORTER) as Teleporter;//addGameObject(GameObjectType.TELEPORTER) as Teleporter;
    teleporter.name = "teleporterTrigger"
    setPosition(teleporter, createVector(x, y));
    setBounds(teleporter, width, height);
    addTeleporterStates(teleporter);
    setCollisionBoxFromBoundingBox(teleporter);
    setTarget(teleporter, targetScreenId || EMPTY_SCREEN_ID, targetX, targetY);
    proposeDesignatedState(teleporter, getState(teleporter, TeleporterStates.ACTIVE));
    return teleporter;
}

export function setTarget(teleporter: Teleporter, targetScreenId: number, targetX: number | undefined, targetY: number | undefined): void {
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
    addAnimation(teleporter, createAnimation("TeleporterActive", "./resources/link.png", getPosition(teleporter), teleporter.width, teleporter.height, [{ srcX: 0, srcY: 30 }], 1, false), true);
}

function createTeleporterActiveState(teleporter: Teleporter): State {
    const state: State = createEmptyState(TeleporterStates.ACTIVE);
    state.name = "teleporter active state";
    state.enter = () => {
        setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
    }
    state.update = () => {
        getCollidingGameObjects(teleporter, getCollisionBox(teleporter), filterGameObjects(GameObjectType.PLAYER, getCurrentGameObjects()))
            .forEach(gameObject => {
                teleport(gameObject, teleporter.targetScreenId, teleporter.targetX, teleporter.targetY);
            });
    }
    state.exit = () => {
    };
    return state;
}

export function teleport(gameObject: GameObject, targetScreenId: number, targetX: number | undefined, targetY: number | undefined) {
    switchToScreen(targetScreenId);
    setGameObjectPosition(gameObject, createVector(targetX || getPosition(gameObject).x, targetY || getPosition(gameObject).y));
}