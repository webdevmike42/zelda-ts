import { Animation, drawAnimationAt, getOffsetX, updateAnimation, getOffsetY } from "../animation.js";
import { Box, createBoxInFront, NULL_BOX } from "../box.js";
import { boxesOverlap, boxOverlapSome, getCollidingBoxes, getCollidingGameObjects, getCollidingSolidGameObjects, getCollisionBox, getProspectedCollisionBox, getResolvedSolidCollisionVector, setCollisionBoxFromBoundingBox } from "../collisions.js";
import { isHitBoxOfOwnBullet } from "../gameActors/enemy.js";
import { getPlayer, Player, playerCollectItems } from "../gameActors/player.js";
import { createHitBox, getCollidingHitBoxes, HitBox, hitBoxes, isHitBoxEnabled } from "../hitbox.js";
import { createHurtBox, getCollidingHurtBoxes, HurtBox, hurtBoxes, isHurtBoxEnabled } from "../hurtbox.js";
import { createMappedInput, KEYS, MappedKey } from "../KeyboardInputHandler.js";
import { getCurrentGameObjects, getCurrentVisibleGameObjects } from "../screens.js";
import { CommonStateTypes, getCurrentState, getState, hasDesignatedState, NULL_STATE, proposeDesignatedState, State, switchToState } from "../state.js";
import { addTestResult } from "../tests.js";
import { getRandomInt, getVectorFrameFraction, toRadians } from "../utils.js";
import { createRandom4DirectionViewVector, createVector, NULL_VECTOR, Vector } from "../vector.js";
import { Controller, GameObject, GameObjectType, getCurrentAnimation, getMovementVector, getOverallVector, getPosition, isControlledByAI, moveGameObject, setBounds, setPosition } from "./gameObject.js";
import { getCollidingCollectableItems } from "./item.js";

const globalGameObjects: GameObject[] = [];
let id: number = 0;

export function createGameObject(type: GameObjectType): GameObject {
    return {
        id: id++,
        name: "",
        type: type,
        states: new Map<string, State>(),
        currentState: { ...NULL_STATE },
        defaultState: { ...NULL_STATE },
        designatedState: { ...NULL_STATE },
        viewVector: { ...NULL_VECTOR },
        movementVector: { ...NULL_VECTOR },
        position: { ...NULL_VECTOR },
        width: 0,
        height: 0,
        collisionBox: { ...NULL_BOX },
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
    }
}

export function createGlobalGameObject(type: GameObjectType): GameObject {
    const go = createGameObject(type);
    addToGlobalList(go);
    return go;
}

function addToGlobalList(gameObject: GameObject): void {
    globalGameObjects.push(gameObject);
}

export function addToCurrentGameObjects(gameObject: GameObject): void {
    getCurrentGameObjects().push(gameObject);
}

function updateAI(gameObject: GameObject): void {
    gameObject.ai_update(gameObject);
}

export function updateGameObjects(currentGameTime: number, timeSinceLastTick: number): void {
    handleHitBoxHurtBoxCollisions(timeSinceLastTick);
    getCurrentGameObjects()
        .forEach(gameObject => updateGameObject(gameObject, currentGameTime, timeSinceLastTick));
}

function updateGameObject(gameObject: GameObject, currentGameTime: number, timeSinceLastTick: number): void {
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

    let resolvedMovementVector: Vector = getVectorFrameFraction(getOverallVector(gameObject), timeSinceLastTick);
    moveGameObject(gameObject, getResolvedSolidCollisionVector(gameObject, resolvedMovementVector));

    updateAnimation(getCurrentAnimation(gameObject), currentGameTime);
}

function handleHitBoxHurtBoxCollisions(timeSinceLastTick: number) {
    const prospectedEnabledHurtBoxes: HurtBox[] = hurtBoxes
        .filter(hurtBox => isHurtBoxEnabled(hurtBox.owner))
        .map(hurtBox => {
            const diffVector: Vector = getVectorFrameFraction(getMovementVector(hurtBox.owner), timeSinceLastTick);
            const prospectedBox: Box = getProspectedCollisionBox(hurtBox, diffVector);
            return createHurtBox(prospectedBox.position, prospectedBox.width, prospectedBox.height, hurtBox.owner, hurtBox.enabled);
        });

    const prospectedEnabledHitBoxes: HitBox[] = hitBoxes
        .filter(hb => isHitBoxEnabled(hb.owner))
        .map(hitBox => {
            const diffVector: Vector = getVectorFrameFraction(getMovementVector(hitBox.owner), timeSinceLastTick);
            const prospectedBox: Box = getProspectedCollisionBox(hitBox, diffVector);
            return createHitBox(prospectedBox.position, prospectedBox.width, prospectedBox.height, hitBox.owner, hitBox.damage, hitBox.enabled);
        });

    prospectedEnabledHurtBoxes
        .forEach(hurtBox => {
            const collidingEnabledHitBoxes: HitBox[] = (getCollidingBoxes(hurtBox, prospectedEnabledHitBoxes) as HitBox[])
                .filter(hitBox => hitBox.owner.id !== hurtBox.owner.id && !isHitBoxOfOwnBullet(hurtBox.owner, hitBox));

            if (collidingEnabledHitBoxes.length > 0)
                proposeDesignatedState(hurtBox.owner, getState(hurtBox.owner, CommonStateTypes.HIT), collidingEnabledHitBoxes[0]);
        });
}

function updateGameObjectCurrentState(gameObject: GameObject, currentGameTime: number, timeSinceLastTick: number): void {
    getCurrentState(gameObject).update(currentGameTime, timeSinceLastTick);
}

export function drawGameObjects(ctx: CanvasRenderingContext2D): void {
    getCurrentVisibleGameObjects().forEach(gameObject => {
        const curAnimation: Animation = getCurrentAnimation(gameObject);
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

export function createSolidDummy(x: number, y: number, width: number, height: number): GameObject {
    const dummy: GameObject = createGameObject(GameObjectType.DUMMY);
    setPosition(dummy, createVector(x, y));
    setBounds(dummy, width, height);
    setSolid(dummy);
    setCollisionBoxFromBoundingBox(dummy);

    return dummy;
}

export function filterGameObjects(filterType: GameObjectType, gameObjectArray: GameObject[]): GameObject[] {
    return gameObjectArray.filter(gameObject => gameObject.type === filterType);
}

export function setSolid(gameObject: GameObject, isSolid: boolean = true): void {
    gameObject.isSolid = isSolid;
}

export function isSolid(gameObject: GameObject): boolean {
    return gameObject.isSolid || false;
}

export function getGlobalGameObjects(): GameObject[] {
    return globalGameObjects;
}
export function testGameObjectFactory() {
    addTestResult("gameObjectFactory: ", true);
}