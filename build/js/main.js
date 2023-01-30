import { createPlayer, getPlayer, hasPlayerPressedStart, isPlayerDead } from "./gameActors/player.js";
import { drawGameObjects, updateGameObjects } from "./gameObjects/gameObjectFactory.js";
import { createHudDtoFromGameObject, drawHUD, loadHud } from "./hud.js";
import { initKeyBoardInputHandler } from "./KeyboardInputHandler.js";
import { drawCurrentScreen, init, START_SCREEN_ID, switchToScreen } from "./screens.js";
import { runAllTests } from "./tests.js";
import { readyForNextFrame } from "./utils.js";
var GameState;
(function (GameState) {
    GameState[GameState["RUNNING"] = 0] = "RUNNING";
    GameState[GameState["PAUSING"] = 1] = "PAUSING";
    GameState[GameState["PAUSED"] = 2] = "PAUSED";
    GameState[GameState["UNPAUSING"] = 3] = "UNPAUSING";
    GameState[GameState["GAME_OVER"] = 4] = "GAME_OVER";
})(GameState || (GameState = {}));
let canvas = null;
let ctx = null;
let gameState = null;
let startTime = -1;
let fps = 60;
let timeOfLastTick = 0;
let quitGame = false;
function startNewGame() {
    if ((canvas = document.getElementById("myCanvas")) !== null && (ctx = canvas.getContext("2d")) !== null) {
        initKeyBoardInputHandler();
        init(ctx, "./resources/tiles-overworld.png", { tileWidth: 16, tileHeight: 16, tileCountPerRow: 18, tileFrameThickness: 1, tileSetFrameThickness: 1 });
        /*init(ctx, "./resources/gfx/Overworld.png",
            { tileWidth: 16, tileHeight: 16, tileCountPerRow: 40, tileFrameThickness: 0, tileSetFrameThickness: 0 });*/
        loadHud(ctx, "./resources/pausescreen.png");
        createPlayer(100, 100);
        switchToScreen(START_SCREEN_ID);
        setGameState(GameState.RUNNING);
        requestAnimationFrame(gameLoop);
    }
}
function setGameState(newGameState) {
    gameState = newGameState;
}
function gameLoop(currentTime) {
    if (startTime === -1) {
        startTime = currentTime;
        timeOfLastTick = 0;
    }
    if (readyForNextFrame(currentTime, timeOfLastTick, fps)) {
        updateGame(currentTime - startTime, currentTime - timeOfLastTick);
        drawGame();
        timeOfLastTick = currentTime;
    }
    if (!quitGame)
        requestAnimationFrame(gameLoop);
}
function updateGame(currentGameTime, timeSinceLastTick) {
    switch (gameState) {
        case GameState.RUNNING:
            if (isPlayerDead())
                setGameState(GameState.GAME_OVER);
            if (hasPlayerPressedStart()) {
                gameState = GameState.PAUSING;
            }
            else {
                updateGameObjects(currentGameTime, timeSinceLastTick);
            }
            break;
        case GameState.PAUSING:
            console.log("game pausing...");
            gameState = GameState.PAUSED;
            console.log("game paused");
            break;
        case GameState.PAUSED:
            if (hasPlayerPressedStart()) {
                console.log("game unpausing...");
                gameState = GameState.UNPAUSING;
            }
            break;
        case GameState.UNPAUSING:
            gameState = GameState.RUNNING;
            console.log("game continues");
            break;
        case GameState.GAME_OVER:
            console.log("GAME OVER");
            quitGame = true;
            break;
    }
}
function drawGame() {
    drawCurrentScreen();
    if (ctx)
        drawGameObjects(ctx);
    drawHUD(createHudDtoFromGameObject(getPlayer()));
    /*
    GameObjectModule.drawGameObjects(ctx);
    drawHUD(createHudDtoFromGameObject(player));
    */
}
startNewGame();
runAllTests();
