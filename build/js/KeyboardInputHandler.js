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
    updateKey(key, true, !repeat);
}
function handleKeyUpInput({ key }) {
    updateKey(key, false, false);
}
function updateKey(key, down, pressed) {
    const keyType = getKeyType(key);
    if (!keyType)
        return;
    const mappedKey = mappedInput.get(keyType);
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
    addMappedKey("w", KEYS.UP);
    addMappedKey("a", KEYS.LEFT);
    addMappedKey("s", KEYS.DOWN);
    addMappedKey("d", KEYS.RIGHT);
    addMappedKey("k", KEYS.ACTION);
    addMappedKey("l", KEYS.DASH);
    addMappedKey("Enter", KEYS.START);
    addMappedKey(" ", KEYS.SELECT);
}
function addMappedKey(key, keyType) {
    mappedInput.set(keyType, { key: key, down: false, pressed: false });
    keyToTypeMapping.set(key, keyType);
}
export function isAnyMovementKeyDown() {
    return isKeyDown(KEYS.UP) || isKeyDown(KEYS.LEFT) || isKeyDown(KEYS.DOWN) || isKeyDown(KEYS.RIGHT);
}
export function isKeyPressed(keyType) {
    const mappedKey = mappedInput.get(keyType);
    if (mappedKey === null || mappedKey === void 0 ? void 0 : mappedKey.pressed) {
        //pressed must be consumened, otherwise, with a high framerate, it will be available in more than one frame
        mappedKey.pressed = false;
        return true;
    }
    return false;
}
export function isKeyDown(keyType) {
    var _a;
    return ((_a = mappedInput.get(keyType)) === null || _a === void 0 ? void 0 : _a.down) || false;
}
