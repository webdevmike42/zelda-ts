import { isVisible } from "./gameObjects/gameObject.js";
import { getAllScreensAsArray, loadScreenById } from "./mockServer.js";
import { createSolidDummy, getGlobalGameObjects } from "./gameObjects/gameObjectFactory.js";
import { removeAllHitBoxes, setHitBoxesFromGameObjects } from "./hitbox.js";
export const CANVAS_WIDTH = 256;
export const CANVAS_HEIGHT = 240;
export const WORLD_MAP_ROWS = 8;
export const WORLD_MAP_COLS = 16;
export let TILE_WIDTH = 16;
export let TILE_HEIGHT = 16;
//export const TILE_COUNT_PER_ROW = 18;
export let TILE_COUNT_PER_ROW = 40;
export let TILE_FRAME_THICKNESS = 1; //border between two frames in pixels
//export const TILESET_FRAME_THICKNESS = 1; //outer border of tileset in pixels
export let TILESET_FRAME_THICKNESS = 0; //outer border of tileset in pixels
export const EMPTY_SCREEN_ID = -1;
export const START_SCREEN_ID = 119;
let tileSetMetaData;
let tileMapImage;
let ctx;
let currentScreen;
let currentGameObjects = [];
let screens;
function setTileSetMetaData(newTileSetMetaData) {
    tileSetMetaData = newTileSetMetaData;
}
export function init(renderingContext, imageUrl, tileSetMetaData) {
    tileMapImage = new Image();
    tileMapImage.src = imageUrl;
    ctx = renderingContext;
    setTileSetMetaData(tileSetMetaData);
    screens = getAllScreensAsArray();
}
export function renderTileMap(tileMapDataArray) {
    for (let i = 0; i < tileMapDataArray.length; i++) {
        for (let j = 0; j < tileMapDataArray[i].length; j++) {
            const calcSrcX = (tileMapDataArray[i][j] % tileSetMetaData.tileCountPerRow) * (tileSetMetaData.tileWidth + tileSetMetaData.tileFrameThickness) + tileSetMetaData.tileSetFrameThickness;
            const calcSrcY = Math.floor(tileMapDataArray[i][j] / tileSetMetaData.tileCountPerRow) * (tileSetMetaData.tileHeight + tileSetMetaData.tileFrameThickness) + tileSetMetaData.tileSetFrameThickness;
            ctx.drawImage(tileMapImage, calcSrcX, calcSrcY, tileSetMetaData.tileWidth, tileSetMetaData.tileHeight, j * tileSetMetaData.tileWidth, i * tileSetMetaData.tileHeight, tileSetMetaData.tileWidth, tileSetMetaData.tileHeight);
        }
    }
}
export function switchToScreen(screenId) {
    if (isValidScreenId(screenId)) {
        cleanupCurrentScreen();
        loadCurrentScreen(screenId);
    }
}
function cleanupCurrentScreen() {
    removeAllHitBoxes();
    currentGameObjects = [];
}
function loadCurrentScreen(screenId) {
    currentScreen = screens[screenId];
    //refresh non persistent game objects by loading from server
    currentGameObjects.push(...loadScreenById(screenId).gameObjects);
    currentGameObjects.push(...currentScreen.persistedGameObjects);
    currentGameObjects.push(...getGlobalGameObjects());
    currentGameObjects.push(...addCollisionObjectsFromTileMap(currentScreen.tileMap, currentScreen.collisionCells));
    setHitBoxesFromGameObjects(currentGameObjects);
}
export function getCurrentGameObjects() {
    return currentGameObjects;
}
export function getCurrentVisibleGameObjects() {
    return currentGameObjects.filter(gameObject => isVisible(gameObject));
}
export function removeGameObject(gameObject) {
    currentGameObjects = currentGameObjects.filter(go => go.id !== gameObject.id);
}
export function drawCurrentScreen() {
    renderTileMap(getCurrentScreenTileMap());
}
function addCollisionObjectsFromTileMap(tileMapDataArray, collisionCells) {
    const solidDummies = [];
    for (let row = 0; row < tileMapDataArray.length; row++) {
        let arr = tileMapDataArray[row];
        arr.forEach((tile, col) => {
            if (collisionCells.indexOf(tile) !== -1) {
                solidDummies.push(createSolidDummy(col * TILE_WIDTH, row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT));
            }
        });
    }
    return solidDummies;
}
function getCurrentScreenTileMap() {
    return (currentScreen === null || currentScreen === void 0 ? void 0 : currentScreen.tileMap) || [];
}
function isValidScreenId(screenId) {
    //todo: check screenId against data source
    return screenId > EMPTY_SCREEN_ID && screenId <= WORLD_MAP_COLS * WORLD_MAP_ROWS;
}
export function getGameObjectById(gameObjectId, gameObjectArray) {
    for (let i = 0; i < gameObjectArray.length; i++) {
        if (gameObjectArray[i].id === gameObjectId) {
            return gameObjectArray[i];
        }
    }
    return null;
}
