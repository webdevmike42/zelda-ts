import { GameObject, GameObjectType } from "./gameObjects/gameObject.js";
import { getRandomValueFromArray } from "./utils.js";

export enum KEYS {
    UP = "up",
    LEFT = "left",
    DOWN = "down",
    RIGHT = "right",
    ACTION = "action",
    DASH = "dash",
    START = "start",
    SELECT = "select"
}

export interface MappedKey {
    key: string,
    down: boolean,
    pressed: boolean
}

export interface MappedInput {
    mappedInput: Map<KEYS, MappedKey>;
}

const registeredGameObjects: GameObject[] = [];
const mappedInput: Map<KEYS, MappedKey> = new Map<KEYS, MappedKey>();
const keyToTypeMapping: Map<string, KEYS> = new Map<string, KEYS>();

document.addEventListener("keydown", handleKeyDownInput);
document.addEventListener("keyup", handleKeyUpInput);

function handleKeyDownInput({ key, repeat }: { key: string, repeat: boolean }): void {
    //updateKey(key, true, !repeat);
    updateMappedInputs(key, true, !repeat);
}

function handleKeyUpInput({ key }: { key: string }): void {
    //updateKey(key, false, false);
    updateMappedInputs(key, false, false);
}

function updateMappedInputs(key: string, down: boolean, pressed: boolean): void {
    registeredGameObjects.forEach(go => {
        updateKey(getMappedInput(go), key, down, pressed);
    });
}

function updateKey(mappedInput: MappedInput, key: string, down: boolean, pressed: boolean): void {
    const keyType: KEYS | undefined = getKeyType(key);
    if (!keyType)
        return;
    const mappedKey: MappedKey | undefined = mappedInput.mappedInput.get(keyType);
    if (!mappedKey)
        return;

    mappedKey.down = down;
    mappedKey.pressed = pressed;
}

function updateKeyByKeyType(mappedInput: MappedInput, keyType: KEYS, down: boolean, pressed: boolean): void {
    const mappedKey: MappedKey | undefined = mappedInput.mappedInput.get(keyType);
    if (!mappedKey)
        return;

    mappedKey.down = down;
    mappedKey.pressed = pressed;
}

function getKeyType(key: string): KEYS | undefined {
    return keyToTypeMapping.get(key);
}

export function registerGameObjectForKeyBoardInput(gameObject: GameObject) {
    registeredGameObjects.push(gameObject);
}

export function initKeyBoardInputHandler() {
    mappedInput.clear();
    keyToTypeMapping.clear();
    /*
    addMappedKey(mappedInput, "w", KEYS.UP);
    addMappedKey(mappedInput,"a", KEYS.LEFT);
    addMappedKey(mappedInput,"s", KEYS.DOWN);
    addMappedKey(mappedInput,"d", KEYS.RIGHT);
    addMappedKey(mappedInput,"k", KEYS.ACTION);
    addMappedKey(mappedInput,"l", KEYS.DASH);
    addMappedKey(mappedInput,"Enter", KEYS.START);
    addMappedKey(mappedInput," ", KEYS.SELECT);
    */
}

function addMappedKey(mappedInput: MappedInput, key: string, keyType: KEYS) {
    mappedInput.mappedInput.set(keyType, { key: key, down: false, pressed: false });
    keyToTypeMapping.set(key, keyType);
}

export function isAnyMovementKeyDown(mappedInput: MappedInput): boolean {
    return isKeyDown(mappedInput, KEYS.UP) || isKeyDown(mappedInput, KEYS.LEFT) || isKeyDown(mappedInput, KEYS.DOWN) || isKeyDown(mappedInput, KEYS.RIGHT);
}

export function isKeyPressed(mappedInput: MappedInput, keyType: KEYS): boolean {
    const mappedKey = mappedInput.mappedInput.get(keyType);
    if (mappedKey?.pressed) {
        //pressed must be consumened, otherwise, with a high framerate, it will be available in more than one frame
        mappedKey.pressed = false;
        return true;
    }
    return false;
}

export function isKeyDown(mappedInput: MappedInput, keyType: KEYS): boolean {
    return mappedInput.mappedInput.get(keyType)?.down || false;
}

export function createMappedInput(): MappedInput {
    const mappedInput: MappedInput = {
        mappedInput: new Map<KEYS, MappedKey>()
    };

    addMappedKey(mappedInput, "w", KEYS.UP);
    addMappedKey(mappedInput, "a", KEYS.LEFT);
    addMappedKey(mappedInput, "s", KEYS.DOWN);
    addMappedKey(mappedInput, "d", KEYS.RIGHT);
    addMappedKey(mappedInput, "k", KEYS.ACTION);
    addMappedKey(mappedInput, "l", KEYS.DASH);
    addMappedKey(mappedInput, "Enter", KEYS.START);
    addMappedKey(mappedInput, " ", KEYS.SELECT);
    return mappedInput;
}

export function getMappedInput(gameObject: GameObject): MappedInput {
    return gameObject.mappedInput;
}

export function pressAndHoldKey(mappedInput: MappedInput, keyType: KEYS): void {
    updateKeyByKeyType(mappedInput, keyType, true, true);
}

export function pressKey(mappedInput: MappedInput, keyType: KEYS): void {
    updateKeyByKeyType(mappedInput, keyType,false,true);
}

export function releaseKey(mappedInput: MappedInput, keyType: KEYS): void {
    updateKeyByKeyType(mappedInput, keyType, false, false);
}

export function pressAndHoldRandomMovementKey(mappedInput: MappedInput): void {
    const movementKeys: KEYS[] = [KEYS.UP, KEYS.LEFT, KEYS.DOWN, KEYS.RIGHT];
    pressAndHoldKey(mappedInput, getRandomValueFromArray(movementKeys));
}

export function releaseAllKeys(mappedInput: MappedInput): void {
    for (const keyType of mappedInput.mappedInput.keys()) {
        releaseKey(mappedInput, keyType);
    }
}

export function reverseMovementInput(mappedInput:MappedInput):void{
    if(isKeyDown(mappedInput,KEYS.UP)){
        releaseKey(mappedInput,KEYS.UP);
        pressAndHoldKey(mappedInput,KEYS.DOWN);
    } else{
        if(isKeyDown(mappedInput,KEYS.DOWN)){
            releaseKey(mappedInput,KEYS.DOWN);
            pressAndHoldKey(mappedInput,KEYS.UP);
        }   
    }

    if(isKeyDown(mappedInput,KEYS.LEFT)){
        releaseKey(mappedInput,KEYS.LEFT);
        pressAndHoldKey(mappedInput,KEYS.RIGHT);
    } else{
        if(isKeyDown(mappedInput,KEYS.RIGHT)){
            releaseKey(mappedInput,KEYS.RIGHT);
            pressAndHoldKey(mappedInput,KEYS.LEFT);
        }   
    }
}