import { createMovementVector, GameObject, GameObjectType, getCurrentAnimation, getPosition, getViewVector, isGameObjectDead, setAIControlled, setBounds, setCurrentAnimation, setGameObjectPosition, setHealth, setMaxHealth, setMovementVector, setPlayerControlled, setPosition, setViewVector, setVisible, startCoolDown } from "../gameObjects/gameObject.js";
import { getMappedInput, isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS, registerGameObjectForKeyBoardInput } from "../KeyboardInputHandler.js";
import { addState, createEmptyState, getState, CommonStateTypes, setDefaultState, State, switchToState, proposeDesignatedState, getCurrentState } from "../state.js";
import { addAnimation, createAnimation, getAnimation } from "../animation.js";
import { createVector, get4DirectionVector, normalizedVector, NULL_VECTOR, Vector, vectorScalarProduct, vectorSum } from "../vector.js";
import { getCollidingGameObjects, setCollisionBox } from "../collisions.js";
import { createBox, createBoxInFront } from "../box.js";
import { createGlobalGameObject, filterGameObjects } from "../gameObjects/gameObjectFactory.js";
import { HitBox, removeHitBox, setHitBox, setHitBoxesFromGameObjects, spawnHitBoxInFrontOf } from "../hitbox.js";
import { disableHurtBox, enableHurtBox, setHurtBoxFromBoundingBox } from "../hurtbox.js";
import { Item } from "../gameObjects/item.js";
import { addToInventory } from "../inventory.js";
import { getCurrentGameObjects, removeGameObject } from "../screens.js";
import { grabPushBox, releasePushBox } from "../gameObjects/pushbox.js";
import { Chest, openChest } from "../gameObjects/chest.js";


const PLAYER_WIDTH: number = 16, PLAYER_HEIGHT: number = 16, PLAYER_DEFAULT_VIEW_VECTOR: Vector = createVector(1, 0);
let player: Player;

enum PlayerStateTypes {
    CollectMajorItem = "CollectMajorItem",
    PUSHING = "Pushing"
}

export interface Player extends GameObject {
    hasSword: boolean,
    pickUpMajorItemState: State,
    keys: number,
    rupees: number,
    bombs: number
}

export function createPlayer(x: number, y: number): Player {
    player = createGlobalGameObject(GameObjectType.PLAYER) as Player;
    player.name = "player";
    setPosition(player, createVector(x, y));
    setBounds(player, PLAYER_WIDTH, PLAYER_HEIGHT);
    addPlayerStates(player);
    addPlayerAnimations(player);
    addPlayerMovement(player);
    setCollisionBox(player, createBox(getPosition(player).x + 2, getPosition(player).y + Math.floor(player.height / 2), player.width - 4, Math.floor(player.height / 2)));
    setHurtBoxFromBoundingBox(player);
    setHealth(player, 8);
    setMaxHealth(player, 8);
    setViewVector(player, PLAYER_DEFAULT_VIEW_VECTOR);
    player.hasSword = false;
    player.keys = 2;
    player.rupees = 106;
    player.bombs = 17;
    player.ignoreConveyor = false;
    player.coolDownDurationInMS = 500;
    //setPlayerControlled(player);
    
    proposeDesignatedState(player, getState(player, CommonStateTypes.IDLE), ["bliblablub"]);
    
    return player;
}

function addPlayerStates(player: Player): void {
    const idleState: State = createPlayerIdleState(player);
    addState(player, CommonStateTypes.IDLE, idleState);
    addState(player, CommonStateTypes.MOVING, createPlayerMovingState(player));
    addState(player, CommonStateTypes.ACTION, createPlayerActionState(player));
    addState(player, CommonStateTypes.HIT, createPlayerHitState(player));
    addState(player, PlayerStateTypes.CollectMajorItem, createPlayerCollectmajorItemState(player));
    addState(player, PlayerStateTypes.PUSHING, createPlayerPushingState(player));
    setDefaultState(player, idleState);
}

function createPlayerIdleState(player: Player): State {
    const state: State = createEmptyState(CommonStateTypes.IDLE);
    state.name = "player idle state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, { ...NULL_VECTOR });
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        //console.log(isAnyMovementKeyDown(getMappedInput(player)));
        if (isAnyMovementKeyDown(getMappedInput(player))) {
            proposeDesignatedState(player, getState(player, CommonStateTypes.MOVING));
            return;
        }
        if (isKeyPressed(getMappedInput(player), KEYS.ACTION)) {
            const collidingObjects: GameObject[] = getCollidingGameObjects(player, createBoxInFront(player, player.width, player.height), getCurrentGameObjects())
            const pushBoxes: GameObject[] = filterGameObjects(GameObjectType.PUSH_BOX, collidingObjects);
            if (pushBoxes.length > 0)
                proposeDesignatedState(player, getState(player, PlayerStateTypes.PUSHING), pushBoxes[0]);
            else {
                const closedChests: Chest[] = (filterGameObjects(GameObjectType.CHEST, collidingObjects) as Chest[])
                    .filter(chest => !chest.isOpen);
                if (closedChests.length > 0)
                    openChest(closedChests[0]);
                else
                    proposeDesignatedState(player, getState(player, CommonStateTypes.ACTION));
            }
            return;
        }
        if (isKeyPressed(getMappedInput(player), KEYS.DASH)) {
            const majorItem: Item = filterGameObjects(GameObjectType.ITEM, getCurrentGameObjects())[0] as Item;
            setGameObjectPosition(majorItem, createVector(majorItem.position.x, majorItem.position.y + 20))
            //console.log(getPosition(majorItem));
        }
    }
    state.exit = () => {/*console.log("exit " + state.name)*/ };
    return state;
}

function createPlayerMovingState(player: Player): State {
    let movingSpeed = 100;
    const state: State = createEmptyState(CommonStateTypes.MOVING);
    state.name = "player moving state";
    state.enter = () => {/*console.log("enter " + state.name)*/ };
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
        if (isKeyPressed(getMappedInput(player), KEYS.ACTION)) {
            proposeDesignatedState(player, getState(player, CommonStateTypes.ACTION));
            return;
        }
        if (!isAnyMovementKeyDown(getMappedInput(player))) {
            proposeDesignatedState(player, getState(player, CommonStateTypes.IDLE));
            return;
        }
        const movementVector = createMovementVector(getMappedInput(player));
        setMovementVector(player, vectorScalarProduct(movingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);

    }
    state.exit = () => { };
    return state;
}

function createPlayerActionState(player: Player): State {
    let durationInMS: number = 50;
    //let hitBox: HitBox;

    const state: State = createEmptyState(CommonStateTypes.ACTION);
    state.name = "player action state";
    state.enter = () => {
        updateCurrentAnimationBasedOnViewVector(player);
        setMovementVector(player, { ...NULL_VECTOR });
        spawnHitBoxInFrontOf(player, 1);
        setTimeout(proposeDesignatedState, durationInMS, player, getState(player, CommonStateTypes.IDLE));
    }
    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
    }
    state.exit = () => {
        removeHitBox(player);
    };
    return state;
}

function createPlayerHitState(player: Player): State {
    let hitBox: HitBox;
    let startTime = -1;
    let knockBackDurationInMs: number = 50, knockBackVector: Vector;

    const state: State = createEmptyState(CommonStateTypes.HIT);
    state.name = "player hit state";

    state.init = (hb: HitBox) => {
        hitBox = hb;
        console.log(hitBox.owner.type)
    }

    state.enter = () => {
        if (player.health)
            player.health -= hitBox.damage;

        knockBackVector =
            vectorScalarProduct(200,
                normalizedVector(
                    createVector(player.position.x - hitBox.position.x, player.position.y - hitBox.position.y)
                )
            );
        startPlayerCoolDown(player);
    };

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {

        if (startTime === -1) {
            startTime = currentGameTime;
        }

        if ((currentGameTime - startTime) >= knockBackDurationInMs) {
            proposeDesignatedState(player, getState(player, CommonStateTypes.IDLE), "return from hit state")
        }

        setMovementVector(player, knockBackVector);
    };
    state.exit = () => {
        startTime = -1;
        console.log("exit hit state")
    };
    return state;
}

function createPlayerCollectmajorItemState(player: Player): State {
    const state: State = createEmptyState(PlayerStateTypes.CollectMajorItem);
    let majorItem: Item;
    let durationInMS: number = 2000;
    state.name = "player collect major item state";

    state.init = (majorItemArg: Item) => {
        majorItem = majorItemArg;
    }

    state.enter = () => {
        player.ignoreConveyor = true;
        majorItem.isCollected = true;
        disableHurtBox(player);
        setMovementVector(player, { ...NULL_VECTOR });
        setCurrentAnimation(player, getAnimation(player, PlayerStateTypes.CollectMajorItem));
        setGameObjectPosition(majorItem, vectorSum(getPosition(player), createVector(player.width / 2 - majorItem.width / 4, -majorItem.height)));
        setTimeout(proposeDesignatedState, durationInMS, player, getState(player, CommonStateTypes.IDLE));
    }

    state.update = (currentGameTime: number, timeSinceLastTick: number) => {
    };

    state.exit = () => {
        enableHurtBox(player);
        player.ignoreConveyor = false;
        setVisible(majorItem, false);
    }
    return state;
}

function createPlayerPushingState(player: Player): State {
    let pushingSpeed: number = 50;
    let pushBox: GameObject;
    const state: State = createEmptyState(PlayerStateTypes.PUSHING);
    state.name = "player pushing state";

    state.init = (pushBoxArg: GameObject) => {
        pushBox = pushBoxArg;
    }

    state.enter = () => {
        grabPushBox(pushBox, player);
    }
    state.update = () => {
        if (!isKeyDown(getMappedInput(player), KEYS.ACTION)) {
            proposeDesignatedState(player, getState(player, CommonStateTypes.IDLE));
        }

        const movementVector = createMovementVector(getMappedInput(player));
        setMovementVector(player, vectorScalarProduct(pushingSpeed, movementVector));
        setViewVector(player, get4DirectionVector(movementVector));
        updateCurrentAnimationBasedOnViewVector(player);
    }

    state.exit = () => {
        releasePushBox(pushBox);
    }

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
    addAnimation(player, createAnimation(PlayerStateTypes.CollectMajorItem, "./resources/link.png", getPosition(player), player.width, player.height, [{ srcX: 30, srcY: 150 }], 1, false));
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

export function playerCollectItems(items: Item[]): void {
    items.filter(item => !item.isMajorItem).forEach(minorItem => {
        addToInventory(player, minorItem);
        removeGameObject(minorItem);
    });

    const majorItems: Item[] = items.filter(item => item.isMajorItem);

    if (majorItems.length > 0) {
        proposeDesignatedState(player, getState(player, PlayerStateTypes.CollectMajorItem), majorItems[0]);
    }
}

export function addKeys(amount: number): void {
    player.keys += amount;
}

export function getPlayer(): Player {
    return player;
}

function startPlayerCoolDown(player: Player): void {
    console.log("COOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL")
    startCoolDown(player, disableHurtBox, enableHurtBox);
}

export function hasPlayerPressedStart(): boolean {
    return isKeyPressed(getMappedInput(player), KEYS.START);
}