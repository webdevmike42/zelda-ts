import { GameObject } from "./gameObjects/gameObject.js";
import { loadScreenById } from "./mockServer.js";
import { createSolidDummy, getGlobalGameObjects } from "./gameObjects/gameObjectFactory.js"

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
    collisionCells: number[]
}

let tileMapImage: HTMLImageElement;
let ctx: CanvasRenderingContext2D;
export let currentScreen: Screen;
//let screens: Screen[];

export function init(renderingContext: CanvasRenderingContext2D, imageUrl: string): void {
    tileMapImage = new Image();
    tileMapImage.src = imageUrl;
    ctx = renderingContext;
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
        //unloadCurrentScreen();
        //setCurrentScreen(screenId);
        loadCurrentScreen(screenId);
    }
}

export function getCurrentGameObjects(): GameObject[] {
    return currentScreen?.gameObjects || [];
}

export function drawCurrentScreen() {
    renderTileMap(getCurrentScreenTileMap());
}

/*
export function loadScreens() {
    screens = getAllScreensAsArray();
}
*/
function setCurrentScreen(screenId: number): void {
    //currentScreen = screens[screenId];
}

function loadCurrentScreen(screenId: number) {
    currentScreen = loadScreenById(screenId);
    currentScreen.gameObjects.push(...getGlobalGameObjects());
    currentScreen.gameObjects.push(...addCollisionObjectsFromTileMap(currentScreen.tileMap, currentScreen.collisionCells));
}

function unloadCurrentScreen() {
    //removeNonGlobalGameObjects();
}


function addCollisionObjectsFromTileMap(tileMapDataArray: number[][], collisionCells: number[]): GameObject[] {
    const solidDummies:GameObject[] = [];
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