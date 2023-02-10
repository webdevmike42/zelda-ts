import { Animation, NULL_ANIMATION } from "../animation.js";
import { Box, createBox } from "../box.js";
import { getCollidingSolidGameObjects, getProspectedCollisionBox, getCollisionBox } from "../collisions.js";
import { HitBox } from "../hitbox.js";
import { HurtBox } from "../hurtbox.js";
import { isKeyDown, KEYS, MappedInput, MappedKey, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { getCurrentGameObjects } from "../screens.js";
import { State } from "../state.js";
import { createVector, NULL_VECTOR, Vector, vectorDiff, vectorSum } from "../vector.js";
import { getCollidingActiveConveyors, getConveyingVectorSum } from "./conveyor.js";

export interface GameObject {
    id: number;
    name: string;
    type: GameObjectType;
    states: Map<string, State>;
    currentState: State;
    defaultState: State;
    designatedState: State;
    position: Vector;
    width: number,
    height: number,
    collisionBox: Box;
    animations?: Map<string, Animation>;
    currentAnimation?: Animation,
    defaultAnimation?: Animation,
    isVisible: boolean,
    viewVector: Vector,
    movementVector: Vector,
    isSolid?: boolean;
    internalId?: number;
    hitBox?: HitBox;
    hurtBox?: HurtBox;
    health?: number;
    maxHealth?: number;
    ignoreConveyor: boolean;
    hitSolid: boolean;
    coolDownDurationInMS: number;
    isCoolingDown: boolean;
    ai_NextAction: Function;
    ai_TimeRangeToNextAction: number[];
    ai_update: Function;
    mappedInput: MappedInput;
    controller: Controller;
}

export enum Controller {
    PLAYER,
    AI,
    SCRIPT
}
export enum GameObjectType {
    PLAYER,
    ITEM,
    CONVEYOR,
    TELEPORTER,
    HAZARD,
    DUMMY,
    FLOOR_SWITCH,
    DOOR,
    PUSH_BOX,
    CHEST,
    MISC,
    OKTOROK,
    STALFOS,
    GORIYA,
    BULLET
}

export function getCurrentAnimation(gameObject: GameObject): Animation {
    return gameObject.currentAnimation || gameObject.defaultAnimation || { ...NULL_ANIMATION };
}

export function setCurrentAnimation(gameObject: GameObject, animation: Animation): void {
    gameObject.currentAnimation = animation;
}

export function setPosition(object: GameObject | Box | Animation, newPosition: Vector): void {
    object.position = { ...newPosition };
}

export function setBounds(gameObject: GameObject, width: number, height: number): void {
    gameObject.width = width;
    gameObject.height = height;
}

export function getBoundingBox(gameObject: GameObject): Box {
    return createBox(gameObject.position.x, gameObject.position.y, gameObject.width, gameObject.height);
}

export function getPosition(object: GameObject | Box | Animation): Vector {
    return object.position;
}

export function setMovementVector(gameObject: GameObject, movementVector: Vector): void {
    gameObject.movementVector = { ...movementVector };
}

export function getMovementVector(gameObject: GameObject): Vector {
    return gameObject.movementVector;
}

export function getOverallVector(gameObject: GameObject): Vector {
    return vectorSum(getMovementVector(gameObject), getConveyingVectorSum(getCollidingActiveConveyors(gameObject)));
}

export function setViewVector(gameObject: GameObject, viewVector: Vector): void {
    gameObject.viewVector = { ...viewVector };
}

export function getViewVector(gameObject: GameObject): Vector {
    return gameObject.viewVector;
}

export function getCenter(gameObject: GameObject): Vector {
    const position = getPosition(gameObject);
    return createVector(position.x + Math.floor(gameObject.width / 2), position.y + Math.floor(gameObject.height / 2));
}

export function createMovementVector(mappedInput: MappedInput): Vector {
    let movementVector: Vector = { ...NULL_VECTOR };
    if (isKeyDown(mappedInput, KEYS.UP)) movementVector = vectorSum(movementVector, createVector(0, -1))
    if (isKeyDown(mappedInput, KEYS.LEFT)) movementVector = vectorSum(movementVector, createVector(-1, 0))
    if (isKeyDown(mappedInput, KEYS.DOWN)) movementVector = vectorSum(movementVector, createVector(0, 1))
    if (isKeyDown(mappedInput, KEYS.RIGHT)) movementVector = vectorSum(movementVector, createVector(1, 0))
    return movementVector;
}

export function isMoving(movementVector: Vector): boolean {
    return movementVector.x !== 0 || movementVector.y !== 0;
}

export function moveGameObject(gameObject: GameObject, moveBy: Vector): void {
    setPosition(gameObject, vectorSum(getPosition(gameObject), moveBy));
    if (gameObject.currentAnimation)
        gameObject.currentAnimation.position = vectorSum(gameObject.currentAnimation.position, moveBy);
    if (gameObject.hitBox) {
        //if(gameObject.type === GameObjectType.HAZARD) //console.log(gameObject.hitBox);
        gameObject.hitBox.position = vectorSum(gameObject.hitBox.position, moveBy);
    }
    if (gameObject.hurtBox)
        gameObject.hurtBox.position = vectorSum(gameObject.hurtBox.position, moveBy);

    /*
if (gameObject.type === GameObjectType.PLAYER) {
    const player: Player = gameObject as Player;
    player.actionBox.position = vectorSum(player.actionBox.position, moveBy);
}
*/

    gameObject.collisionBox.position = vectorSum(gameObject.collisionBox.position, moveBy);
}

function move(position: Vector, moveBy: Vector): void {
    position = vectorSum(position, moveBy);
}

export function setGameObjectPosition(gameObject: GameObject, newPosition: Vector): void {
    const diffVector = vectorDiff(newPosition, getPosition(gameObject));
    if (getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), getCurrentGameObjects()).length === 0) {
        moveGameObject(gameObject, diffVector);
    }
}

export function setHealth(gameObject: GameObject, health: number): void {
    gameObject.health = health;
}

export function setMaxHealth(gameObject: GameObject, maxHealth: number): void {
    gameObject.maxHealth = maxHealth;
}

export function isGameObjectDead(gameObject: GameObject): boolean {
    return getHealth(gameObject) <= 0;
}

export function getHealth(gameObject: GameObject): number {
    return gameObject.health || 0;
}

export function setVisible(gameObject: GameObject, isVisible: boolean): void {
    gameObject.isVisible = isVisible;
}

export function isVisible(gameObject: GameObject): boolean {
    return gameObject.isVisible || false;
}

export function startCoolDown(gameObject: GameObject, onCooldownStart: Function, onCooldownEnd: Function, coolDownDurationInMS?: number): void {
    gameObject.isCoolingDown = true;
    onCooldownStart(gameObject);
    setTimeout(() => {
        onCooldownEnd(gameObject);
        gameObject.isCoolingDown = false;
    }, coolDownDurationInMS || gameObject.coolDownDurationInMS, gameObject);
}

export function isCoolingDown(gameObject: GameObject): boolean {
    return gameObject.isCoolingDown;
}

function setController(gameObject: GameObject, newController: Controller): void {
    gameObject.controller = newController;
}

export function setPlayerControlled(gameObject: GameObject): void {
    setController(gameObject, Controller.PLAYER);
    registerGameObjectForKeyBoardInput(gameObject);
}

export function setAIControlled(gameObject: GameObject): void {
    setController(gameObject, Controller.AI);
}

export function setScriptControlled(gameObject: GameObject): void {
    setController(gameObject, Controller.SCRIPT);
}

export function isControlledByAI(gameObject: GameObject): boolean {
    return gameObject.controller === Controller.AI;
}