import { drawAnimationAt, getOffsetX, updateAnimation, getOffsetY } from "../animation.js";
import { NULL_BOX } from "../box.js";
import { getCollidingBoxes, getProspectedCollisionBox, getResolvedSolidCollisionVector, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { isHitBoxOfOwnBullet } from "../gameActors/enemy.js";
import { playerCollectItems } from "../gameActors/player.js";
import { createHitBox, hitBoxes, isHitBoxEnabled } from "../hitbox.js";
import { createHurtBox, hurtBoxes, isHurtBoxEnabled } from "../hurtbox.js";
import { createMappedInput } from "../KeyboardInputHandler.js";
import { getCurrentGameObjects, getCurrentVisibleGameObjects } from "../screens.js";
import { CommonStateTypes, getCurrentState, getState, hasDesignatedState, NULL_STATE, proposeDesignatedState, switchToState } from "../state.js";
import { addTestResult } from "../tests.js";
import { getVectorFrameFraction } from "../utils.js";
import { createVector, NULL_VECTOR } from "../vector.js";
import { Controller, GameObjectType, getCurrentAnimation, getMovementVector, getOverallVector, getPosition, isControlledByAI, moveGameObject, setBounds, setPosition } from "./gameObject.js";
import { getCollidingCollectableItems } from "./item.js";
const globalGameObjects = [];
let id = 0;
export function createGameObject(type) {
    return {
        id: id++,
        name: "",
        type: type,
        states: new Map(),
        currentState: Object.assign({}, NULL_STATE),
        defaultState: Object.assign({}, NULL_STATE),
        designatedState: Object.assign({}, NULL_STATE),
        viewVector: Object.assign({}, NULL_VECTOR),
        movementVector: Object.assign({}, NULL_VECTOR),
        position: Object.assign({}, NULL_VECTOR),
        width: 0,
        height: 0,
        collisionBox: Object.assign({}, NULL_BOX),
        isVisible: true,
        ignoreConveyor: false,
        hitSolid: false,
        coolDownDurationInMS: 0,
        isCoolingDown: false,
        ai_NextAction: () => { },
        ai_TimeRangeToNextAction: [0, 0],
        ai_update: () => { },
        mappedInput: createMappedInput(),
        controller: Controller.SCRIPT
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
export function addToCurrentGameObjects(gameObject) {
    getCurrentGameObjects().push(gameObject);
}
function updateAI(gameObject) {
    gameObject.ai_update(gameObject);
}
export function updateGameObjects(currentGameTime, timeSinceLastTick) {
    handleHitBoxHurtBoxCollisions(timeSinceLastTick);
    getCurrentGameObjects()
        .forEach(gameObject => updateGameObject(gameObject, currentGameTime, timeSinceLastTick));
}
function updateGameObject(gameObject, currentGameTime, timeSinceLastTick) {
    if (isControlledByAI(gameObject)) {
        updateAI(gameObject);
    }
    updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick);
    if (gameObject.type === GameObjectType.PLAYER) {
        playerCollectItems(getCollidingCollectableItems(gameObject));
    }
    if (hasDesignatedState(gameObject)) {
        switchToState(gameObject, gameObject.designatedState);
    }
    let resolvedMovementVector = getVectorFrameFraction(getOverallVector(gameObject), timeSinceLastTick);
    moveGameObject(gameObject, getResolvedSolidCollisionVector(gameObject, resolvedMovementVector));
    updateAnimation(getCurrentAnimation(gameObject), currentGameTime);
}
function handleHitBoxHurtBoxCollisions(timeSinceLastTick) {
    const prospectedEnabledHurtBoxes = hurtBoxes
        .filter(hurtBox => isHurtBoxEnabled(hurtBox.owner))
        .map(hurtBox => {
        const diffVector = getVectorFrameFraction(getMovementVector(hurtBox.owner), timeSinceLastTick);
        const prospectedBox = getProspectedCollisionBox(hurtBox, diffVector);
        return createHurtBox(prospectedBox.position, prospectedBox.width, prospectedBox.height, hurtBox.owner, hurtBox.enabled);
    });
    const prospectedEnabledHitBoxes = hitBoxes
        .filter(hb => isHitBoxEnabled(hb.owner))
        .map(hitBox => {
        const diffVector = getVectorFrameFraction(getMovementVector(hitBox.owner), timeSinceLastTick);
        const prospectedBox = getProspectedCollisionBox(hitBox, diffVector);
        return createHitBox(prospectedBox.position, prospectedBox.width, prospectedBox.height, hitBox.owner, hitBox.damage, hitBox.enabled);
    });
    prospectedEnabledHurtBoxes
        .forEach(hurtBox => {
        const collidingEnabledHitBoxes = getCollidingBoxes(hurtBox, prospectedEnabledHitBoxes)
            .filter(hitBox => hitBox.owner.id !== hurtBox.owner.id && !isHitBoxOfOwnBullet(hurtBox.owner, hitBox));
        if (collidingEnabledHitBoxes.length > 0)
            proposeDesignatedState(hurtBox.owner, getState(hurtBox.owner, CommonStateTypes.HIT), collidingEnabledHitBoxes[0]);
    });
}
function updateGameObjectCurrentState(gameObject, currentGameTime, timeSinceLastTick) {
    getCurrentState(gameObject).update(currentGameTime, timeSinceLastTick);
}
export function drawGameObjects(ctx) {
    getCurrentVisibleGameObjects().forEach(gameObject => {
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
export function setSolid(gameObject, isSolid = true) {
    gameObject.isSolid = isSolid;
}
export function isSolid(gameObject) {
    return gameObject.isSolid || false;
}
export function getGlobalGameObjects() {
    return globalGameObjects;
}
export function testGameObjectFactory() {
    addTestResult("gameObjectFactory: ", true);
}
