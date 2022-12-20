import { Animation, drawAnimation, NULL_ANIMATION, updateAnimation } from "../animation.js";
import { NULL_STATE, State } from "../state.js";
import { addTestResult } from "../tests.js";
import { compose, pipe } from "../utils.js";
import { GameObject, GameObjectType, getCurrentAnimation } from "./gameObject.js";

let gameObjects: GameObject[] = [];
let id: number = 0;

export const addGameObject = pipe<GameObjectType, GameObject>(createGameObject, register);
export const addSolidGameObject = pipe<GameObjectType, GameObject>(createGameObject, register, setSolid);
export const createTestGameObject = createGameObject.bind(null, GameObjectType.DUMMY);

export function createGameObject(type: GameObjectType): GameObject {
    return {
        id: id++,
        type: type,
        states: new Map<string, State>(),
        currentState: { ...NULL_STATE },
        defaultState: { ...NULL_STATE }
    }
}

function register<T extends GameObject>(gameObject: T): T {
    if (!isRegistered(gameObject.id))
        gameObjects.push(gameObject);

    return gameObject;
}

export function updateGameObjects(currentGameTime: number): void {
    gameObjects.forEach(gameObject => {
        updateAnimation(getCurrentAnimation(gameObject), currentGameTime);
    });
}

export function drawGameObjects(ctx: CanvasRenderingContext2D): void {
    gameObjects.forEach(gameObject => {
        drawAnimation(getCurrentAnimation(gameObject),ctx);
    })
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

/*
function unregister(gameObject: GameObject): GameObject {
    if (isRegistered(gameObject.id))
        removeFromGameObjects(gameObject);

    return gameObject;
}
*/
/*
function removeFromGameObjects(gameObject: GameObject): void {
    gameObjects.splice(gameObjects.map(obj => obj.id).indexOf(gameObject.id), 1);
}
*/

export function removeAllGameObjects() {
    gameObjects = [];
}

function setSolid(gameObject: GameObject, isSolid: boolean = true): GameObject {
    return {
        ...gameObject,
        isSolid: isSolid
    }
}

function getGameObjectCount() {
    return gameObjects.length;
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

    go = addSolidGameObject(GameObjectType.ITEM);
    addTestResult("addSolidGameObject", go.type === GameObjectType.ITEM && go.isSolid === true);

    removeAllGameObjects();
    addGameObject(GameObjectType.DUMMY);
    const goToBeRemoved = addGameObject(GameObjectType.CONVEYOR);
    removeGameObject(goToBeRemoved);
    addTestResult("removeGameObject", getGameObjectCount() === 1 && !isRegistered(goToBeRemoved.id));
    removeAllGameObjects();
}