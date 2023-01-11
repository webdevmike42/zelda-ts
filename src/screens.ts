import { GameObject, GameObjectType, isVisible } from "./gameObjects/gameObject.js";
import { getAllScreensAsArray, loadScreenById } from "./mockServer.js";
import { createSolidDummy, filterGameObjects, getGlobalGameObjects } from "./gameObjects/gameObjectFactory.js"
import { removeAllHitBoxes } from "./hitbox.js";

export const CANVAS_WIDTH = 256;
export const CANVAS_HEIGHT = 240;
export const WORLD_MAP_ROWS = 8;
export const WORLD_MAP_COLS = 16;
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const TILE_COUNT_PER_ROW = 18;
export const TILE_FRAME_THICKNESS = 1;
export const EMPTY_SCREEN_ID = -1;
export const START_SCREEN_ID = 119;

export interface Screen {
    id: number,
    music: string,
    tileMap: number[][],
    gameObjects: GameObject[],
    persistedGameObjects:GameObject[],
    collisionCells: number[]
}

let tileMapImage: HTMLImageElement;
let ctx: CanvasRenderingContext2D;
let currentScreen: Screen;
let currentGameObjects:GameObject[] = [];
let screens: Screen[];

export function init(renderingContext: CanvasRenderingContext2D, imageUrl: string): void {
    tileMapImage = new Image();
    tileMapImage.src = imageUrl;
    ctx = renderingContext;
    screens = getAllScreensAsArray();
    console.clear();
    console.log(screens[119])
}

export function renderTileMap(tileMapDataArray: number[][]) {
    for (let i = 0; i < tileMapDataArray.length; i++) {
        for (let j = 0; j < tileMapDataArray[i].length; j++) {
            ctx.drawImage(
                tileMapImage,
                ((tileMapDataArray[i][j] % TILE_COUNT_PER_ROW) * (TILE_COUNT_PER_ROW - 1)) + TILE_FRAME_THICKNESS,
                (Math.floor(tileMapDataArray[i][j] / TILE_COUNT_PER_ROW) * (TILE_COUNT_PER_ROW - 1)) + TILE_FRAME_THICKNESS,
                TILE_WIDTH,
                TILE_HEIGHT,
                j * TILE_WIDTH,
                i * TILE_HEIGHT,
                TILE_WIDTH,
                TILE_HEIGHT
            );
        }
    }
}

export function switchToScreen(screenId: number) {
    if (isValidScreenId(screenId)) {
        cleanupCurrentScreen();
        loadCurrentScreen(screenId);
    }
}

function cleanupCurrentScreen(): void {
    removeAllHitBoxes();
    currentGameObjects = [];
}

function loadCurrentScreen(screenId: number) {
    currentScreen = screens[screenId];

    //refresh non persistent game objects by loading from server
    currentGameObjects.push(...loadScreenById(screenId).gameObjects);
    currentGameObjects.push(...currentScreen.persistedGameObjects);
    currentGameObjects.push(...getGlobalGameObjects());
    currentGameObjects.push(...addCollisionObjectsFromTileMap(currentScreen.tileMap, currentScreen.collisionCells));
    console.clear();
    console.log(currentScreen.persistedGameObjects)
}

export function getCurrentGameObjects(): GameObject[] {
    return currentGameObjects;
}

export function getCurrentVisibleGameObjects(): GameObject[] {
    return currentGameObjects.filter(gameObject => isVisible(gameObject));
}

export function removeGameObject(gameObject: GameObject): void {
    currentGameObjects = currentGameObjects.filter(go => go.id !== gameObject.id);
}

export function drawCurrentScreen() {
    renderTileMap(getCurrentScreenTileMap());
}

function addCollisionObjectsFromTileMap(tileMapDataArray: number[][], collisionCells: number[]): GameObject[] {
    const solidDummies: GameObject[] = [];
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
    return currentScreen?.tileMap || [];
}

function isValidScreenId(screenId: number) {
    //todo: check screenId against data source
    return screenId > EMPTY_SCREEN_ID && screenId <= WORLD_MAP_COLS * WORLD_MAP_ROWS;
}

export function getGameObjectById(gameObjectId: number, gameObjectArray: GameObject[]) {
    for (let i = 0; i < gameObjectArray.length; i++) {
        if (gameObjectArray[i].id === gameObjectId) {
            return gameObjectArray[i];
        }
    }
    return null;
}