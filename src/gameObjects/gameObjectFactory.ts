import { addAnimation, createAnimation, drawAnimation, setCurrentAnimation, updateAnimation } from "../animation.js";
import { NULL_BOX } from "../box.js";
import { getResolvedSolidCollisionVector, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { isAnyMovementKeyDown, isKeyDown, KEYS } from "../KeyboardInputHandler.js";
import { getCurrentState, NULL_STATE, setDesignatedState, State, switchToState } from "../state.js";
import { addTestResult } from "../tests.js";
import { compose, getVectorFrameFraction, pipe } from "../utils.js";
import { createVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { GameObject, GameObjectType, getCurrentAnimation, getMovementVector, getPosition, isMoving, moveGameObject, setBounds, setPosition } from "./gameObject.js";

let gameObjects: GameObject[] = [];
let id: number = 0;

export const addGameObject = pipe<GameObjectType, GameObject>(createGameObject, register);
export const createTestGameObject = createGameObject.bind(null, GameObjectType.DUMMY);

export function createGameObject(type: GameObjectType): GameObject {
    return {
        id: id++,
        type: type,
        states: new Map<string, State>(),
        currentState: { ...NULL_STATE },
        defaultState: { ...NULL_STATE },
        designatedState: null,
        viewVector: { ...NULL_VECTOR },
        movementVector: { ...NULL_VECTOR },
        position: { ...NULL_VECTOR },
        width: 0,
        height: 0,
        collisionBox: { ...NULL_BOX }
    }
}

function register<T extends GameObject>(gameObject: T): T {
    if (!isRegistered(gameObject.id))
        gameObjects.push(gameObject);

    return gameObject;
}

export function updateGameObjects(currentGameTime: number, timeSinceLastTick: number): void {
    gameObjects.forEach(gameObject => {
        updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick);

        if (gameObject.designatedState !== null) {
            switchToState(gameObject, gameObject.designatedState);
            setDesignatedState(gameObject, null);
        }

        if (isMoving(getMovementVector(gameObject))) {
            let resolvedMovementVector: Vector = getVectorFrameFraction(getMovementVector(gameObject), timeSinceLastTick);
            moveGameObject(gameObject, getResolvedSolidCollisionVector(gameObject, resolvedMovementVector));
        }

        updateAnimation(getCurrentAnimation(gameObject), currentGameTime);
    });
}

function updateGameObjectCurrentState(gameObject: GameObject, currentGameTime: number, timeSinceLastTick: number): void {
    getCurrentState(gameObject).update(currentGameTime, timeSinceLastTick);
}

export function drawGameObjects(ctx: CanvasRenderingContext2D): void {
    gameObjects.forEach(gameObject => {
        drawAnimation(getCurrentAnimation(gameObject), ctx);
    })
}

export function addSolidDummy(x: number, y: number, width: number, height: number): GameObject {
    const dummy: GameObject = addGameObject(GameObjectType.DUMMY);
    setPosition(dummy, createVector(x, y));
    setBounds(dummy, width, height);
    setSolid(dummy);
    setCollisionBoxFromBoundingBox(dummy);
    const a = createAnimation("dummyFacingUp", "./resources/link.png", getPosition(dummy), dummy.width, dummy.height, [{ srcX: 62, srcY: 0 }], 1, false)
    addAnimation(dummy, a);
    setCurrentAnimation(dummy, a);
    return dummy;
}

export function filterGameObjects(filterType: GameObjectType, gameObjectArray: GameObject[]): GameObject[] {
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

function removeGameObject<T extends GameObject>(gameObject: T): void {
    gameObjects = gameObjects.filter(go => go.id !== gameObject.id);
}

function isRegistered(gameObjectId: number): boolean {
    return gameObjects.some(go => go.id === gameObjectId);
}

export function removeAllGameObjects() {
    gameObjects = [];
}

function setSolid(gameObject: GameObject, isSolid: boolean = true): void {
    gameObject.isSolid = isSolid;
}

export function isSolid(gameObject: GameObject): boolean {
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