import { NULL_STATE } from "./state.js";
import { addTestResult } from "./tests.js";
import { pipe } from "./utils.js";
export var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["PLAYER"] = 0] = "PLAYER";
    GameObjectType[GameObjectType["ITEM"] = 1] = "ITEM";
    GameObjectType[GameObjectType["CONVEYOR"] = 2] = "CONVEYOR";
    GameObjectType[GameObjectType["DUMMY"] = 3] = "DUMMY";
})(GameObjectType || (GameObjectType = {}));
let gameObjects = [];
let id = 0;
export const addGameObject = pipe(createGameObject, register);
export const addSolidGameObject = pipe(createGameObject, register, setSolid);
export const createTestGameObject = createGameObject.bind(null, GameObjectType.DUMMY);
//removeGameObject = pipe<GameObject,GameObject>(unregister);
function removeGameObject(gameObject) {
    gameObjects = gameObjects.filter(go => go.id !== gameObject.id);
}
function register(gameObject) {
    if (!isRegistered(gameObject.id))
        gameObjects.push(gameObject);
    return gameObject;
}
function isRegistered(gameObjectId) {
    return gameObjects.some(go => go.id === gameObjectId);
}
export function createGameObject(type) {
    return {
        id: id++,
        type: type,
        states: new Map(),
        currentState: Object.assign({}, NULL_STATE),
        defaultState: Object.assign({}, NULL_STATE)
    };
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
function setSolid(gameObject, isSolid = true) {
    return Object.assign(Object.assign({}, gameObject), { isSolid: isSolid });
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
}
