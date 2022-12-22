import { createPlayer } from "./gameActors/player.js";
import { addSolidDummy, drawGameObjects, updateGameObjects } from "./gameObjects/gameObjectFactory.js";
import { initKeyBoardInputHandler, isKeyPressed, KEYS } from "./KeyboardInputHandler.js";
import { drawCurrentScreen, init, loadScreens, START_SCREEN_ID, switchToScreen } from "./screens.js";
import { runAllTests } from "./tests.js";
import { readyForNextFrame } from "./utils.js";
var GameState;
(function (GameState) {
    GameState[GameState["RUNNING"] = 0] = "RUNNING";
    GameState[GameState["PAUSING"] = 1] = "PAUSING";
    GameState[GameState["PAUSED"] = 2] = "PAUSED";
    GameState[GameState["UNPAUSING"] = 3] = "UNPAUSING";
})(GameState || (GameState = {}));
let canvas = null;
let ctx = null;
let gameState = null;
let startTime = -1;
let fps = 60;
let timeOfLastTick = 0;
function startNewGame() {
    if ((canvas = document.getElementById("myCanvas")) !== null && (ctx = canvas.getContext("2d")) !== null) {
        initKeyBoardInputHandler();
        init(ctx, "./resources/tiles-overworld.png");
        createPlayer(100, 100);
        addSolidDummy(120, 100);
        loadScreens();
        switchToScreen(START_SCREEN_ID);
        /*
        loadHud(ctx, "/resources/pausescreen.png");
        */
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
    //handlePlayerInput();
    if (readyForNextFrame(currentTime, timeOfLastTick, fps)) {
        updateGame(currentTime - startTime, currentTime - timeOfLastTick);
        drawGame();
        timeOfLastTick = currentTime;
    }
    requestAnimationFrame(gameLoop);
}
function updateGame(currentGameTime, timeSinceLastTick) {
    switch (gameState) {
        case GameState.RUNNING:
            if (isKeyPressed(KEYS.START)) {
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
function drawGame() {
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
