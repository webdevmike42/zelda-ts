import { drawAnimationAt, getOffsetX, updateAnimation, getOffsetY } from "../animation.js";
import { NULL_BOX } from "../box.js";
import { getResolvedSolidCollisionVector, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { playerPickUpItems } from "../gameActors/player.js";
import { getCollidingHitBoxes } from "../hitbox.js";
import { isHurtBoxEnabled } from "../hurtbox.js";
import { currentScreen, getCurrentGameObjects } from "../screens.js";
import { CommonStateTypes, getCurrentState, getState, NULL_STATE, setDesignatedState, switchToState } from "../state.js";
import { addTestResult } from "../tests.js";
import { getVectorFrameFraction } from "../utils.js";
import { createVector, NULL_VECTOR } from "../vector.js";
import { GameObjectType, getCurrentAnimation, getMovementVector, getPosition, isMoving, moveGameObject, setBounds, setPosition } from "./gameObject.js";
import { getCollidingCollectableItems } from "./item.js";
const globalGameObjects = [];
let id = 0;
export function createGameObject(type) {
    return {
        id: id++,
        type: type,
        states: new Map(),
        currentState: Object.assign({}, NULL_STATE),
        defaultState: Object.assign({}, NULL_STATE),
        designatedState: null,
        stateArgs: [],
        viewVector: Object.assign({}, NULL_VECTOR),
        movementVector: Object.assign({}, NULL_VECTOR),
        position: Object.assign({}, NULL_VECTOR),
        width: 0,
        height: 0,
        collisionBox: Object.assign({}, NULL_BOX)
    };
}
export function createGlobalGameObject(type) {
    const go = createGameObject(type);
    addToGlobalList(go);
    return go;
}
function addToGlobalList(gameObject) {
    globalGameObjects.push(gameObject);
}
export function updateGameObjects(currentGameTime, timeSinceLastTick) {
    getCurrentGameObjects().forEach(gameObject => {
        updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick);
        if (isHurtBoxEnabled(gameObject)) {
            const chb = getCollidingHitBoxes(gameObject);
            if (chb.length > 0) {
                setDesignatedState(gameObject, getState(gameObject, CommonStateTypes.HIT), chb);
            }
        }
        if (gameObject.type === GameObjectType.PLAYER)
            playerPickUpItems(getCollidingCollectableItems(gameObject));
        if (gameObject.designatedState !== null) {
            console.log(gameObject.designatedState);
            switchToState(gameObject, gameObject.designatedState);
            gameObject.designatedState = null;
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
    getCurrentGameObjects().forEach(gameObject => {
        const curAnimation = getCurrentAnimation(gameObject);
        drawAnimationAt(curAnimation, ctx, getPosition(gameObject).x + getOffsetX(curAnimation), getPosition(gameObject).y + getOffsetY(curAnimation));
        /*
                if (gameObject.hurtBox && isHurtBoxEnabled(gameObject)) {
                    //draw hurtbox
                    ctx.fillStyle = "rgba(0, 100, 0, 0.5)";
                    ctx.fillRect(gameObject.hurtBox.position.x, gameObject.hurtBox.position.y, gameObject.hurtBox.width, gameObject.hurtBox.height)
                }
        
                if (gameObject.hitBox && isHitBoxEnabled(gameObject)) {
                    //draw hitbox
                    ctx.fillStyle = "rgba(100, 0, 0, 0.5)";
                    ctx.fillRect(gameObject.hitBox.position.x, gameObject.hitBox.position.y, gameObject.hitBox.width, gameObject.hitBox.height)
                }
                */
    });
}
export function createSolidDummy(x, y, width, height) {
    const dummy = createGameObject(GameObjectType.DUMMY);
    setPosition(dummy, createVector(x, y));
    setBounds(dummy, width, height);
    setSolid(dummy);
    setCollisionBoxFromBoundingBox(dummy);
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
/*
function isRegistered(gameObjectId: number): boolean {
    return currentGameObjects.some(go => go.id === gameObjectId);
}

export function removeAllGameObjects() {
    currentGameObjects = [];
}
*/
export function setSolid(gameObject, isSolid = true) {
    gameObject.isSolid = isSolid;
}
export function isSolid(gameObject) {
    return gameObject.isSolid || false;
}
function getGameObjectCount() {
    return currentScreen.gameObjects.length;
    //return currentGameObjects.length;
}
export function getGameObjects() {
    return currentScreen.gameObjects;
    //return currentGameObjects;
}
/*
export function setCurrentGameObjects(gameObjects: GameObject[]): void {
    currentGameObjects = gameObjects;
}
*/
export function getGlobalGameObjects() {
    return globalGameObjects;
}
/*

export function addToCurrentGameObjects(newGameObjects: GameObject[]): void {
    currentGameObjects.push(...newGameObjects);
}

export function removeNonGlobalGameObjects(): void {
    currentScreen.gameObjects.filter(gameObject => !gameObject.global);
}
*/
export function testGameObjectFactory() {
    addTestResult("gameObjectsFactory: ", true);
    /*
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
    */
}
