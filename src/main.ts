
import { Animation, createAnimation, drawAnimation, updateAnimation } from "./animation.js"
import { createPlayer, Player } from "./gameActors/player.js"
import { getCurrentAnimation } from "./gameObjects/gameObject.js"
import { drawGameObjects, updateGameObjects } from "./gameObjects/gameObjectFactory.js"
import { initKeyBoardInputHandler, isAnyMovementKeyDown, isKeyDown, isKeyPressed, KEYS } from "./KeyboardInputHandler.js"
import { drawCurrentScreen, init, loadScreens, renderTileMap, START_SCREEN_ID, switchToScreen } from "./screens.js"
import { runAllTests } from "./tests.js"
import { readyForNextFrame } from "./utils.js"

enum GameState {
    RUNNING,
    PAUSING,
    PAUSED,
    UNPAUSING
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let gameState: GameState | null = null;
let startTime: number = -1;
let fps: number = 60;
let timeOfLastTick: number = 0;

function startNewGame(): void {
    if ((canvas = document.getElementById("myCanvas") as HTMLCanvasElement) !== null && (ctx = canvas.getContext("2d")) !== null) {
        initKeyBoardInputHandler();
        init(ctx, "./resources/tiles-overworld.png");
        createPlayer(100, 100);
        createPlayer(100, 140);
        loadScreens();
        switchToScreen(START_SCREEN_ID);
        /*
        loadHud(ctx, "/resources/pausescreen.png");
        */
        setGameState(GameState.RUNNING);
        requestAnimationFrame(gameLoop);
    }
}

function setGameState(newGameState: GameState): void {
    gameState = newGameState;
}

function gameLoop(currentTime: number): void {
    if (startTime === -1) {
        startTime = currentTime;
        timeOfLastTick = 0;
    }

    //handlePlayerInput();

    if (readyForNextFrame(currentTime, timeOfLastTick, fps)) {
        updateGame(currentTime - startTime, currentTime - timeOfLastTick);
        drawGame();
        timeOfLastTick = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

function updateGame(currentGameTime: number, timeSinceLastTick: number): void {
    switch (gameState) {
        case GameState.RUNNING:
            if (isKeyPressed(KEYS.START)) {
                gameState = GameState.PAUSING;
            } else {
                updateGameObjects(currentGameTime);
            }
            break;
        case GameState.PAUSING:
            console.log("game pausing...");
            gameState = GameState.PAUSED;
            console.log("game paused");
            break;
        case GameState.PAUSED:
            if (isKeyPressed(KEYS.START)) {
                console.log("game unpausing...");
                gameState = GameState.UNPAUSING;
            }
            break;
        case GameState.UNPAUSING:
            gameState = GameState.RUNNING;
            console.log("game continues");
            return;
    }
}


function drawGame(): void {
    drawCurrentScreen();
    if (ctx)
        drawGameObjects(ctx);

    /*
    GameObjectModule.drawGameObjects(ctx);
    drawHUD(createHudDtoFromGameObject(player));
    */
}

runAllTests();

startNewGame();