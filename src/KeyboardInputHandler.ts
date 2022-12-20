import { GameObject } from "./gameObjects/gameObject";

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

interface MappedKey {
    key: string,
    down: boolean,
    pressed: boolean
}

const registeredGameObjects: GameObject[] = [];
const mappedInput: Map<KEYS, MappedKey> = new Map<KEYS, MappedKey>();
const keyToTypeMapping: Map<string, KEYS> = new Map<string, KEYS>();

document.addEventListener("keydown", handleKeyDownInput);
document.addEventListener("keyup", handleKeyUpInput);

function handleKeyDownInput({ key, repeat }: { key: string, repeat: boolean }): void {
    updateKey(key, true, !repeat);
}

function handleKeyUpInput({ key }: { key: string }): void {
    updateKey(key, false, false);
}

function updateKey(key: string, down: boolean, pressed: boolean): void {
    const keyType: KEYS | undefined = getKeyType(key);
    if (!keyType)
        return;
    const mappedKey: MappedKey | undefined = mappedInput.get(keyType);
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
    addMappedKey("w", KEYS.UP);
    addMappedKey("a", KEYS.LEFT);
    addMappedKey("s", KEYS.DOWN);
    addMappedKey("d", KEYS.RIGHT);
    addMappedKey("k", KEYS.ACTION);
    addMappedKey("l", KEYS.DASH);
    addMappedKey("Enter", KEYS.START);
    addMappedKey(" ", KEYS.SELECT);
}

function addMappedKey(key: string, keyType: KEYS) {
    mappedInput.set(keyType, { key: key, down: false, pressed: false });
    keyToTypeMapping.set(key, keyType);
}

export function isAnyMovementKeyDown(): boolean {
    return isKeyDown(KEYS.UP) || isKeyDown(KEYS.LEFT) || isKeyDown(KEYS.DOWN) || isKeyDown(KEYS.RIGHT);
}

export function isKeyPressed(keyType: KEYS): boolean {
    const mappedKey = mappedInput.get(keyType);
    if(mappedKey?.pressed){
        //pressed must be consumened, otherwise, with a high framerate, it will be available in more than one frame
        mappedKey.pressed = false;
        return true;
    }
    return false;
}

export function isKeyDown(keyType: KEYS): boolean {
    return mappedInput.get(keyType)?.down || false;
}