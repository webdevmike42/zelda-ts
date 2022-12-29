import { createMovementVector, GameObject, GameObjectType, getBoundingBox, getCurrentAnimation, getMovementVector, getPosition, getViewVector, moveGameObject, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyDown, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, State, setCurrentState, switchToState, setDesignatedState, getCurrentState } from "../state.js";
import { addAnimation, createAnimation, getAnimation, Animation } from "../animation.js";
import { createVector, get4DirectionVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { setCollisionBox, getCollidingBoxes, getCollidingGameObjects, getCollidingSolidGameObjects } from "../collisions.js";
import { createBox } from "../box.js";
import { createGlobalGameObject } from "../gameObjects/gameObjectFactory.js";

const PLAYER_WIDTH: number = 16, PLAYER_HEIGHT: number = 16;

export interface Player extends GameObject {
    test: boolean
}

export function createPlayer(x: number, y: number): Player {
    const player: Player = createGlobalGameObject(GameObjectType.PLAYER) as Player;
    setPosition(player, createVector(x, y));
    setBounds(player, PLAYER_WIDTH, PLAYER_HEIGHT);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
    switchToState(player, getState(player, CommonStateTypes.IDLE));
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    setDefaultState(player, idleState);
}

function createPlayerIdleState(player: Player): State {
    const state: State = createEmptyState();
    state.type = CommonStateTypes.IDLE;
    state.name = "player idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, { ...NULL_VECTOR });
    }
    state.update = () => {
        if (isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStateTypes.MOVING));
            return;
        }
    }
    state.exit = () => {/*console.log("exit " + state.name)*/ };
    return state;
}

function createPlayerMovingState(player: Player): State {
    let movingSpeed = 100;
    const state: State = createEmptyState();
    state.type = CommonStateTypes.MOVING;
    state.name = "player moving state";
    state.enter = () => {/*console.log("enter " + state.name)*/ };
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);

    }
    state.exit = () => {/*console.log("exit " + state.name)*/ };
    return state;
}

function addPlayerAnimations(player: Player): void {
    player.animations = new Map<string, Animation>();
    addPlayerIdleAnimations(player);
    addPlayerMovingAnimations(player);
}

function addPlayerIdleAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }], 1, false));
    setCurrentAnimation(player, getAnimation(player, CommonStateTypes.IDLE + "Down"));
}

function addPlayerMovingAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    setCurrentAnimation(player, getAnimation(player, CommonStateTypes.MOVING + "Down"));
}

function updateCurrentAnimationBasedOnViewVector(player: Player): void {
    let currentAnimation = getCurrentAnimation(player);
    const currentPosition = currentAnimation.position;

    currentAnimation = getAnimation(player, getCurrentState(player).type + getDirectionNameFromViewVector(getViewVector(player)));

    setCurrentAnimation(player, currentAnimation);
    currentAnimation.position = { ...currentPosition };
}

function addPlayerMovement(player: Player): void {
    registerGameObjectForKeyBoardInput(player)
}

function getDirectionNameFromViewVector(viewVector: Vector): string {
    if (viewVector.x === 1) return "Right";
    if (viewVector.x === -1) return "Left";
    if (viewVector.y === -1) return "Up";
    return "Down";
}