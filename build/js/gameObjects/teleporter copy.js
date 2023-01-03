import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { EMPTY_SCREEN_ID, switchToScreen } from "../screens.js";
import { addState, createEmptyState, getState, setDefaultState, switchToState } from "../state.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setGameObjectPosition, setPosition } from "./gameObject.js";
import { createGameObject, filterGameObjects, getGameObjects } from "./gameObjectFactory.js";
var TeleporterStates;
(function (TeleporterStates) {
    TeleporterStates["ACTIVE"] = "active";
})(TeleporterStates || (TeleporterStates = {}));
export function createTeleporter(x, y, width, height, targetScreenId, targetX, targetY) {
    const teleporter = createGameObject(GameObjectType.TELEPORTER); //addGameObject(GameObjectType.TELEPORTER) as Teleporter;
    setPosition(teleporter, createVector(x, y));
    setBounds(teleporter, width, height);
    addTeleporterStates(teleporter);
    addTeleporterAnimations(teleporter);
    setCollisionBoxFromBoundingBox(teleporter);
    setTarget(teleporter, targetScreenId || EMPTY_SCREEN_ID, targetX, targetY);
    switchToState(teleporter, getState(teleporter, TeleporterStates.ACTIVE));
    return teleporter;
}
export function setTarget(teleporter, targetScreenId, targetX, targetY) {
    teleporter.targetScreenId = targetScreenId;
    teleporter.targetX = targetX;
    teleporter.targetY = targetY;
}
function addTeleporterStates(teleporter) {
    const activeState = createTeleporterActiveState(teleporter);
    addState(teleporter, TeleporterStates.ACTIVE, activeState);
    setDefaultState(teleporter, activeState);
}
function addTeleporterAnimations(teleporter) {
    teleporter.animations = new Map();
    addAnimation(teleporter, createAnimation("TeleporterActive", "./resources/link.png", getPosition(teleporter), teleporter.width, teleporter.height, [{ srcX: 0, srcY: 30 }], 1, false));
    setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
}
function createTeleporterActiveState(teleporter) {
    const state = createEmptyState();
    state.name = "teleporter active state";
    state.enter = () => {
        console.log("enter: " + state.name);
        setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
    };
    state.update = () => {
        getCollidingGameObjects(teleporter, getCollisionBox(teleporter), filterGameObjects(GameObjectType.PLAYER, getGameObjects()))
            .forEach(gameObject => {
            teleport(gameObject, teleporter.targetScreenId, teleporter.targetX, teleporter.targetY);
        });
    };
    state.exit = () => {
        console.log("exit " + state.name);
    };
    return state;
}
export function teleport(gameObject, targetScreenId, targetX, targetY) {
    switchToScreen(targetScreenId);
    setGameObjectPosition(gameObject, createVector(targetX || getPosition(gameObject).x, targetY || getPosition(gameObject).y));
}