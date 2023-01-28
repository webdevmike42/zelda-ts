import { getRandomValueFromArray } from "./utils.js";
export var KEYS;
(function (KEYS) {
    KEYS["UP"] = "up";
    KEYS["LEFT"] = "left";
    KEYS["DOWN"] = "down";
    KEYS["RIGHT"] = "right";
    KEYS["ACTION"] = "action";
    KEYS["DASH"] = "dash";
    KEYS["START"] = "start";
    KEYS["SELECT"] = "select";
})(KEYS || (KEYS = {}));
const registeredGameObjects = [];
const mappedInput = new Map();
const keyToTypeMapping = new Map();
document.addEventListener("keydown", handleKeyDownInput);
document.addEventListener("keyup", handleKeyUpInput);
function handleKeyDownInput({ key, repeat }) {
    //updateKey(key, true, !repeat);
    updateMappedInputs(key, true, !repeat);
}
function handleKeyUpInput({ key }) {
    //updateKey(key, false, false);
    updateMappedInputs(key, false, false);
}
function updateMappedInputs(key, down, pressed) {
    registeredGameObjects.forEach(go => {
        updateKey(getMappedInput(go), key, down, pressed);
    });
}
function updateKey(mappedInput, key, down, pressed) {
    const keyType = getKeyType(key);
    if (!keyType)
        return;
    const mappedKey = mappedInput.mappedInput.get(keyType);
    if (!mappedKey)
        return;
    mappedKey.down = down;
    mappedKey.pressed = pressed;
}
function updateKeyByKeyType(mappedInput, keyType, down, pressed) {
    const mappedKey = mappedInput.mappedInput.get(keyType);
    if (!mappedKey)
        return;
    mappedKey.down = down;
    mappedKey.pressed = pressed;
}
function getKeyType(key) {
    return keyToTypeMapping.get(key);
}
export function registerGameObjectForKeyBoardInput(gameObject) {
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
function addMappedKey(mappedInput, key, keyType) {
    mappedInput.mappedInput.set(keyType, { key: key, down: false, pressed: false });
    keyToTypeMapping.set(key, keyType);
}
export function isAnyMovementKeyDown(mappedInput) {
    return isKeyDown(mappedInput, KEYS.UP) || isKeyDown(mappedInput, KEYS.LEFT) || isKeyDown(mappedInput, KEYS.DOWN) || isKeyDown(mappedInput, KEYS.RIGHT);
}
export function isKeyPressed(mappedInput, keyType) {
    const mappedKey = mappedInput.mappedInput.get(keyType);
    if (mappedKey === null || mappedKey === void 0 ? void 0 : mappedKey.pressed) {
        //pressed must be consumened, otherwise, with a high framerate, it will be available in more than one frame
        mappedKey.pressed = false;
        return true;
    }
    return false;
}
export function isKeyDown(mappedInput, keyType) {
    var _a;
    return ((_a = mappedInput.mappedInput.get(keyType)) === null || _a === void 0 ? void 0 : _a.down) || false;
}
export function createMappedInput() {
    const mappedInput = {
        mappedInput: new Map()
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
export function getMappedInput(gameObject) {
    return gameObject.mappedInput;
}
export function pressAndHoldKey(mappedInput, keyType) {
    updateKeyByKeyType(mappedInput, keyType, true, true);
}
export function pressKey(mappedInput, keyType) {
    updateKeyByKeyType(mappedInput, keyType, false, true);
}
export function releaseKey(mappedInput, keyType) {
    updateKeyByKeyType(mappedInput, keyType, false, false);
}
export function pressAndHoldRandomMovementKey(mappedInput) {
    const movementKeys = [KEYS.UP, KEYS.LEFT, KEYS.DOWN, KEYS.RIGHT];
    pressAndHoldKey(mappedInput, getRandomValueFromArray(movementKeys));
}
export function releaseAllKeys(mappedInput) {
    for (const keyType of mappedInput.mappedInput.keys()) {
        releaseKey(mappedInput, keyType);
    }
}
