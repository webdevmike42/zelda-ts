import { createMovementVector, GameObject, GameObjectType, getBoundingBox, getCurrentAnimation, getMovementVector, getPosition, getViewVector, moveGameObject, setBounds, setCurrentAnimation, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, State, setCurrentState, switchToState, setDesignatedState, getCurrentState } from "../state.js";
import { addAnimation, createAnimation, getAnimation, Animation } from "../animation.js";
import { createVector, get4DirectionVector, normalizedVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { setCollisionBox, getCollidingBoxes, getCollidingGameObjects, getCollidingSolidGameObjects } from "../collisions.js";
import { createBox, createBoxInFront } from "../box.js";
import { createGlobalGameObject } from "../gameObjects/gameObjectFactory.js";
import { HitBox, hitBoxes, removeHitBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, enableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";

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
    setHurtBoxFromBoundingBox(player);
    player.health = player.maxHealth = 100;
    switchToState(player, getState(player, CommonStateTypes.IDLE));
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    addState(player, CommonStateTypes.ACTION, createPlayerActionState(player));
    addState(player, CommonStateTypes.HIT, createPlayerHitState(player));
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
        if (isKeyPressed(KEYS.ACTION)) {
            setDesignatedState(player, getState(player, CommonStateTypes.ACTION));
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
        if (isKeyPressed(KEYS.ACTION)) {
            setDesignatedState(player, getState(player, CommonStateTypes.ACTION));
            return;
        }
        if (!isAnyMovementKeyDown()) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);

    }
    state.exit = () => { };
    return state;
}

function createPlayerActionState(player: Player): State {
    let startTime: number, duration: number = 50;
    let hitBox: HitBox;

    const state: State = createEmptyState();
    state.type = CommonStateTypes.ACTION;
    state.name = "player action state";
    state.enter = () => {
        startTime = -1;
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, { ...NULL_VECTOR });
        hitBox = spawnHitBoxInFrontOf(player, 1);
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (startTime === -1) {
            startTime = currentGameTime;
        }
        if ((currentGameTime - startTime) >= duration) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
    }
    state.exit = () => {
        removeHitBox(hitBox.id)
    };
    return state;
}

function createPlayerHitState(player: Player): State {
    let hitBox: HitBox;
    let startTime = -1;
    let knockBackAngle: number, knockBackDurationInMs: number, knockBackVector: Vector;

    const state: State = createEmptyState();
    state.type = CommonStateTypes.HIT;
    state.name = "player hit state";

    state.enter = () => {
        console.log("enter player hit state")
        hitBox = player.stateArgs[0] as HitBox;
        if (player.health)
            player.health -= hitBox.damage;
        if (player.hurtBox)
            disableHurtBox(player.hurtBox);

        knockBackAngle = 90;
        knockBackDurationInMs = 50;

        knockBackVector =
            vectorScalarProduct(200,
                normalizedVector(
                    createVector(player.position.x - hitBox.position.x, player.position.y - hitBox.position.y)
                )
            );
    };

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {

        if (startTime === -1) {
            startTime = currentGameTime;
        }

        if ((currentGameTime - startTime) >= knockBackDurationInMs) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE))
            //return GameObjectModule.isDead(player) ? player.getState(PLAYER_STATES.DEATH) : player.getState(PLAYER_STATES.IDLE);
        }

        setMovementVector(player, knockBackVector);
    };
    state.exit = () => {
        startTime = -1;
        if (player.hurtBox)
            enableHurtBox(player.hurtBox);
        console.log("exit hit state")
    };
    return state;
}

function addPlayerAnimations(player: Player): void {
    addPlayerIdleAnimations(player);
    addPlayerMovingAnimations(player);
    addPlayerAttackingAnimations(player);
}

function addPlayerIdleAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }], 1, false));
}

function addPlayerMovingAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(CommonStateTypes.MOVING + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
}

function addPlayerAttackingAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 60, srcY: 84 }], 1, false, createVector(0, -11)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 24, srcY: 90 }], 1, false, createVector(-11, 0)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 0, srcY: 84 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 85, srcY: 90 }], 1, false));
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