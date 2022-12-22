import { addAnimation, createAnimation, drawAnimation, setCurrentAnimation, updateAnimation } from "../animation.js";
import { NULL_BOX } from "../box.js";
import { getResolvedSolidCollisionVector, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { getCurrentState, NULL_STATE, setDesignatedState, switchToState } from "../state.js";
import { addTestResult } from "../tests.js";
import { getVectorFrameFraction, pipe } from "../utils.js";
import { createVector, NULL_VECTOR } from "../vector.js";
import { GameObjectType, getCurrentAnimation, getMovementVector, getPosition, isMoving, moveGameObject, setBounds, setPosition } from "./gameObject.js";
let gameObjects = [];
let id = 0;
export const addGameObject = pipe(createGameObject, register);
export const createTestGameObject = createGameObject.bind(null, GameObjectType.DUMMY);
export function createGameObject(type) {
    return {
        id: id++,
        type: type,
        states: new Map(),
        currentState: Object.assign({}, NULL_STATE),
        defaultState: Object.assign({}, NULL_STATE),
        designatedState: null,
        viewVector: Object.assign({}, NULL_VECTOR),
        movementVector: Object.assign({}, NULL_VECTOR),
        position: Object.assign({}, NULL_VECTOR),
        width: 0,
        height: 0,
        collisionBox: Object.assign({}, NULL_BOX)
    };
}
function register(gameObject) {
    if (!isRegistered(gameObject.id))
        gameObjects.push(gameObject);
    return gameObject;
}
export function updateGameObjects(currentGameTime, timeSinceLastTick) {
    gameObjects.forEach(gameObject => {
        updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick);
        if (gameObject.designatedState !== null) {
            switchToState(gameObject, gameObject.designatedState);
            setDesignatedState(gameObject, null);
        }
        if (isMoving(getMovementVector(gameObject))) {
            let resolvedMovementVector = getVectorFrameFraction(getMovementVector(gameObject), timeSinceLastTick);
            moveGameObject(gameObject, getResolvedSolidCollisionVector(gameObject, resolvedMovementVector));
        }
        updateAnimation(getCurrentAnimation(gameObject), currentGameTime);
    });
}
function updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick) {
    getCurrentState(gameObject).update(currentGameTime, timeSinceLastTick);
}
export function drawGameObjects(ctx) {
    gameObjects.forEach(gameObject => {
        drawAnimation(getCurrentAnimation(gameObject), ctx);
    });
}
export function addSolidDummy(x, y, width, height) {
    const dummy = addGameObject(GameObjectType.DUMMY);
    setPosition(dummy, createVector(x, y));
    setBounds(dummy, width, height);
    setSolid(dummy);
    setCollisionBoxFromBoundingBox(dummy);
    const a = createAnimation("dummyFacingUp", "./resources/link.png", getPosition(dummy), dummy.width, dummy.height, [{ srcX: 62, srcY: 0 }], 1, false);
    addAnimation(dummy, a);
    setCurrentAnimation(dummy, a);
    return dummy;
}
export function filterGameObjects(filterType, gameObjectArray) {
    return gameObjectArray.filter(gameObject => gameObject.type === filterType);
}
/*

export function updateGameObjects(currentGameTime, timeSinceLastTick) {
    gameObjects.forEach(gameObject => {
        prepareTick(gameObject);
        //todo: deal with movementMapper
        
        if (isControlledByAI(gameObject)) {
            updateFakeEnemyAI(gameObject, currentGameTime);
        }

        //Options:
        //1. state zurückbekommen und dann im if-statement im switchGameObjectState ausführen (state bekommen darf nichts verändern (player health, game sounds))
        //zusätzlich namen der funktionen ändern weil "handle" normalerweise command-funct ist
        //2. direkt in handle funktionen änderungen durchführen, aber nichts zurückgeben und im nachhinein wahrscheinlich den currentstate vom gameobject abfragen
        const newState = handleHurtBoxCollisions(gameObject) || handleGameObjectInput(gameObject) || updateGameObjectState(gameObject, currentGameTime, timeSinceLastTick)

        if (newState) {
            switchGameObjectState(gameObject, newState);
            return;//todo: gehts auch ohne return an dieser Stelle? machen die weiteren handle()-Aufrufe vl sogar Sinn?!
        }

        handleEnvironmentVectorUpdate(gameObject);
        handleItemPickup(gameObject);
        handleMovementUpdate(gameObject, timeSinceLastTick);

        handleAnimationUpdate(gameObject, currentGameTime);
    });
}

*/
function removeGameObject(gameObject) {
    gameObjects = gameObjects.filter(go => go.id !== gameObject.id);
}
function isRegistered(gameObjectId) {
    return gameObjects.some(go => go.id === gameObjectId);
}
export function removeAllGameObjects() {
    gameObjects = [];
}
function setSolid(gameObject, isSolid = true) {
    gameObject.isSolid = isSolid;
}
export function isSolid(gameObject) {
    return gameObject.isSolid || false;
}
function getGameObjectCount() {
    return gameObjects.length;
}
export function getGameObjects() {
    return gameObjects;
}
export function testGameObjectFactory() {
    removeAllGameObjects();
    addGameObject(GameObjectType.ITEM);
    addGameObject(GameObjectType.CONVEYOR);
    addTestResult("addGameObject", getGameObjectCount() === 2);
    removeAllGameObjects();
    addTestResult("removeAllGameObjects", getGameObjectCount() === 0);
    let go = createTestGameObject();
    addTestResult("createTestGameObject", go.type === GameObjectType.DUMMY);
    setSolid(go);
    addTestResult("addSolidGameObject", go.isSolid === true);
    removeAllGameObjects();
    addGameObject(GameObjectType.DUMMY);
    const goToBeRemoved = addGameObject(GameObjectType.CONVEYOR);
    removeGameObject(goToBeRemoved);
    addTestResult("removeGameObject", getGameObjectCount() === 1 && !isRegistered(goToBeRemoved.id));
    removeAllGameObjects();
}
