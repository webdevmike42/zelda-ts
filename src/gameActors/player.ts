import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isGameObjectDead, setBounds, setCurrentAnimation, setGameObjectPosition, setHealth, setMaxHealth, setMovementVector, setPosition, setViewVector } from "../gameObjects/gameObject.js";
import { isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, State, switchToState, setDesignatedState, getCurrentState } from "../state.js";
import { addAnimation, createAnimation, getAnimation } from "../animation.js";
import { createVector, get4DirectionVector, normalizedVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { getCollidingGameObjects, getCollisionBox, setCollisionBox } from "../collisions.js";
import { createBox } from "../box.js";
import { createGlobalGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { HitBox, removeHitBox, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, enableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { Item } from "../gameObjects/item.js";
import { addToInventory } from "../inventory.js";
import { getCurrentGameObjects, removeGameObject } from "../screens.js";
import { grabPushBox, releasePushBox } from "../gameObjects/pushbox.js";

const PLAYER_WIDTH: number = 16, PLAYER_HEIGHT: number = 16;
let player: Player;

enum PlayerStateTypes {
    PickUpMajorItem = "PickUpMajorItem",
    PUSHING = "Pushing"
}

export interface Player extends GameObject {
    hasSword: boolean,
    pickUpMajorItemState: State,
    keys: number
}

export function createPlayer(x: number, y: number): Player {
    player = createGlobalGameObject(GameObjectType.PLAYER) as Player;
    setPosition(player, createVector(x, y));
    setBounds(player, PLAYER_WIDTH, PLAYER_HEIGHT);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
    setHurtBoxFromBoundingBox(player);
    setHealth(player, 8);
    setMaxHealth(player, 8);
    switchToState(player, getState(player, CommonStateTypes.IDLE));
    player.hasSword = false;
    player.keys = 0;
    player.ignoreConveyor = false;
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    addState(player, CommonStateTypes.ACTION, createPlayerActionState(player));
    addState(player, CommonStateTypes.HIT, createPlayerHitState(player));
    addState(player, PlayerStateTypes.PickUpMajorItem, createPlayerPickUpmajorItemState(player));
    addState(player, PlayerStateTypes.PUSHING, createPlayerPushingState(player));
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
            const pushBoxes: GameObject[] = filterGameObjects(GameObjectType.PUSH_BOX, getCollidingGameObjects(player, getCollisionBox(player), getCurrentGameObjects()));
            if (pushBoxes.length > 0)
                setDesignatedState(player, getState(player, PlayerStateTypes.PUSHING), [pushBoxes[0]]);
            else
                setDesignatedState(player, getState(player, CommonStateTypes.ACTION));
            return;
        }
        if (isKeyPressed(KEYS.DASH)) {
            const majorItem: Item = filterGameObjects(GameObjectType.ITEM, getCurrentGameObjects())[0] as Item;
            setGameObjectPosition(majorItem, createVector(majorItem.position.x, majorItem.position.y + 20))
            console.log(getPosition(majorItem));
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
        disableHurtBox(player);

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
        enableHurtBox(player);
        console.log("exit hit state")
    };
    return state;
}

function createPlayerPickUpmajorItemState(player: Player): State {
    const state: State = createEmptyState();
    let majorItem: Item | null = null;
    let startTime: number = -1;
    let durationInMS: number = 2000;
    state.type = PlayerStateTypes.PickUpMajorItem;
    state.name = "player pick up major item state";

    state.enter = () => {
        console.log("enter" + state.name)
        if (player.stateArgs.length > 0) {
            player.ignoreConveyor = true;
            majorItem = player.stateArgs[0];

            if (majorItem) {
                majorItem.isCollected = true;
                disableHurtBox(player);
                setMovementVector(player, { ...NULL_VECTOR });
                setCurrentAnimation(player, getAnimation(player, PlayerStateTypes.PickUpMajorItem));
                setGameObjectPosition(majorItem, vectorSum(getPosition(player), createVector(player.width / 2 - majorItem.width / 4, -majorItem.height)));
            }
        }
    }

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (startTime === -1) {
            startTime = currentGameTime;
        }

        if (majorItem === null || (currentGameTime - startTime) >= durationInMS) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
    };

    state.exit = () => {
        enableHurtBox(player);
        startTime = -1;
        player.ignoreConveyor = false;
        if (majorItem)
            removeGameObject(majorItem);
    }
    return state;
}

function createPlayerPushingState(player: Player): State {
    let pushingSpeed: number = 50;
    let pushBox: GameObject;
    const state: State = createEmptyState();
    state.name = "player pushing state";
    state.type = PlayerStateTypes.PUSHING;

    state.enter = () => {
        console.log("enter " + state.name);
        if (player.stateArgs.length > 0) {
            pushBox = player.stateArgs[0];
            grabPushBox(pushBox, player);
        }
    }
    state.update = () => {
        if (!isKeyDown(KEYS.ACTION)) {
            setDesignatedState(player, getState(player, CommonStateTypes.IDLE));
        }

        const movementVector = createMovementVector();
        setMovementVector(player, vectorScalarProduct(pushingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);
    }

    state.exit = () => {
        console.log("exit " + state.name);
        if (pushBox)
            releasePushBox(pushBox);
    }
    /*
    const pushingState = {
        name: "playerPushing",
        type: PLAYER_STATES.PUSHING,
        handleInput: function (input) {
            if (!input[KEYS.ACTION].down) {
                return player.getState(PLAYER_STATES.IDLE);
            }

            const movementVector = getMovementVector(player);

            if (input[KEYS.UP].down) {
                addVector(movementVector, { x: 0, y: -1 });
            }
            if (input[KEYS.LEFT].down) {
                addVector(movementVector, { x: -1, y: 0 });
            }
            if (input[KEYS.DOWN].down) {
                addVector(movementVector, { x: 0, y: 1 });
            }
            if (input[KEYS.RIGHT].down) {
                addVector(movementVector, { x: 1, y: 0 });
            }

            setViewVector(player, { ...movementVector });
            multiplyVector(movementVector, player.movement.speed);
        },

        enter: function () {
            switchAnimation(player, "PlayerIdle", player.directionCode);
            grabPushBox(pushBox, player);
        },

        update: function (currentGameTime, timeSinceLastTick) {

        },

        exit: function () {
            releasePushBox(pushBox);
        }
    }
    */

    return state;
}

function addPlayerAnimations(player: Player): void {
    addPlayerIdleAnimations(player);
    addPlayerMovingAnimations(player);
    addPlayerAttackingAnimations(player);
    addPlayerPickUpItemAnimations(player);
    addPlayerPushingAnimations(player);
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

function addPlayerPushingAnimations(player: Player): void {
    /*
    TODO: PUSHING animation while standing
    
        addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }], 1, false));
        addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }], 1, false));
        addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }], 1, false));
        addAnimation(player, createAnimation(CommonStateTypes.IDLE + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }], 1, false));
    
        */
    addAnimation(player, createAnimation(PlayerStateTypes.PUSHING + "Up", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 62, srcY: 0 }, { srcX: 62, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(PlayerStateTypes.PUSHING + "Left", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 0 }, { srcX: 30, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(PlayerStateTypes.PUSHING + "Down", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 0, srcY: 0 }, { srcX: 0, srcY: 30 }], 6, true));
    addAnimation(player, createAnimation(PlayerStateTypes.PUSHING + "Right", "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 91, srcY: 0 }, { srcX: 91, srcY: 30 }], 6, true));
}

function addPlayerAttackingAnimations(player: Player): void {
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Up", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 60, srcY: 84 }], 1, false, createVector(0, -11)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Left", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 24, srcY: 90 }], 1, false, createVector(-11, 0)));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Down", "./resources/link.png", getPosition(player), player.width, 27, [{ srcX: 0, srcY: 84 }], 1, false));
    addAnimation(player, createAnimation(CommonStateTypes.ACTION + "Right", "./resources/link.png", getPosition(player), 28, player.height, [{ srcX: 85, srcY: 90 }], 1, false));
}

function addPlayerPickUpItemAnimations(player: Player): void {
    addAnimation(player, createAnimation(PlayerStateTypes.PickUpMajorItem, "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 150 }], 1, false));
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

export function isPlayerDead(): boolean {
    return isGameObjectDead(player);
}

export function playerPickUpItems(items: Item[]): void {
    items.filter(item => !item.isMajorItem).forEach(minorItem => {
        addToInventory(player, minorItem);
        removeGameObject(minorItem);
    });

    const majorItems: Item[] = items.filter(item => item.isMajorItem);

    if (majorItems.length > 0) {
        setDesignatedState(player, getState(player, PlayerStateTypes.PickUpMajorItem), [majorItems[0]]);
    }
}

export function addKeys(amount: number): void {
    player.keys += amount;
}