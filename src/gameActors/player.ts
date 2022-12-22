import { addGameObject, getGameObjects } from "../gameObjects/gameObjectFactory.js";
import { createMovementVector, GameObject, GameObjectType, getBoundingBox, getCurrentAnimation, getMovementVector, getPosition, getViewVector, moveGameObject, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyDown, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStates, setDefaultState, State, setCurrentState, switchToState, setDesignatedState } from "../state.js";
import { addAnimation, createAnimation, getAnimation, Animation } from "../animation.js";
import { createVector, get4DirectionVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { setCollisionBox, getCollidingBoxes, getCollidingGameObjects, getCollidingSolidGameObjects } from "../collisions.js";
import { createBox } from "../box.js";

export interface Player extends GameObject {
    test: boolean
}

export function createPlayer(x: number, y: number): Player {
    const player: Player = addGameObject(GameObjectType.PLAYER) as Player;
    setPosition(player, createVector(x, y));
    setBounds(player, 16,16);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
    switchToState(player, getState(player, CommonStates.IDLE));
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStates.IDLE, idleState);
    addState(player, CommonStates.MOVING, createPlayerMovingState(player));
    setDefaultState(player, idleState);
}

function createPlayerIdleState(player: Player): State {
    const state: State = createEmptyState();
    state.name = "player idle state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setMovementVector(player, { ...NULL_VECTOR });
    }
    state.update = () => {
        if (isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.MOVING));
            return;
        }
    }
    state.exit = () => {/*console.log("exit " + state.name)*/};
    return state;
}

function createPlayerMovingState(player: Player): State {
    let movingSpeed = 100;
    const state: State = createEmptyState();
    state.name = "player moving state";
    state.enter = () => {/*console.log("enter " + state.name)*/};
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStates.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updatePlayerCurrentMovingAnimationBasedOnViewVector(player, getViewVector(player));

    }
    state.exit = () => {/*console.log("exit " + state.name)*/};
    return state;
}

function addPlayerAnimations(player: Player): void {
    player.animations = new Map<string, Animation>();
    addPlayerMovingAnimations(player);
}

function addPlayerMovingAnimations(player: Player): void {
    addAnimation(player, createAnimation("PlayerMovingUp", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingLeft", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingDown", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation("PlayerMovingRight", "./resources/link.png", getPosition(player), 16, 16, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
    setCurrentAnimation(player, getAnimation(player, "PlayerMovingDown"));
}

function updatePlayerCurrentMovingAnimationBasedOnViewVector(player: Player, viewVector: Vector): void {
    let currentAnimation = getCurrentAnimation(player);
    const currentPosition = currentAnimation.position;

    if (viewVector.x === 1) currentAnimation = getAnimation(player, "PlayerMovingRight")
    if (viewVector.x === -1) currentAnimation = getAnimation(player, "PlayerMovingLeft")
    if (viewVector.y === -1) currentAnimation = getAnimation(player, "PlayerMovingUp")
    if (viewVector.y === 1) currentAnimation = getAnimation(player, "PlayerMovingDown");
    setCurrentAnimation(player, currentAnimation);
    currentAnimation.position = {...currentPosition};
}

function addPlayerMovement(player: Player): void {
    registerGameObjectForKeyBoardInput(player)
}

function addPlayerCollisionBox(player:Player):void{

}