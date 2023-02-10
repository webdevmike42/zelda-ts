import { readyForNextFrame } from "./utils.js";
import { NULL_VECTOR } from "./vector.js";
const NULL_FRAME = { srcX: 0, srcY: 0, width: 0, height: 0 };
const DEFAULT_FONT = "8px Arial";
const DEFAULT_FILL_STYLE = "black";
export const NULL_ANIMATION = Object.freeze(createAnimation("NULL_ANIMATION", "", Object.assign({}, NULL_VECTOR), 0, 0, [Object.assign({}, NULL_FRAME)], 0, false));
export function createAnimation(uniqueName, imageSrc, position, width, height, frames, framesPerSecond, loop, offset) {
    return {
        name: uniqueName,
        image: (() => {
            const image = new Image();
            image.src = imageSrc;
            return image;
        })(),
        position: Object.assign({}, position),
        width: width,
        height: height,
        frames: frames,
        textFrames: [],
        framesPerSecond: framesPerSecond,
        loop: loop,
        currentFrameIndex: 0,
        timeOfLastFrame: 0,
        offset: offset,
        isTextAnimation: false
    };
}
export function createTextAnimation(uniqueName, animationText, fillStyle, font, position, width, height, framesPerSecond, loop, offset) {
    return {
        name: uniqueName,
        text: animationText,
        fillStyle: fillStyle,
        font: font,
        position: Object.assign({}, position),
        width: width,
        height: height,
        frames: [],
        textFrames: animationText.split(""),
        framesPerSecond: framesPerSecond,
        loop: loop,
        currentFrameIndex: 0,
        timeOfLastFrame: 0,
        offset: offset,
        isTextAnimation: true
    };
}
export function updateAnimation(animation, currentGameTime) {
    if (readyForNextFrame(currentGameTime, animation.timeOfLastFrame, animation.framesPerSecond)) {
        setTimeOfLastFrame(animation, currentGameTime);
        if (canRaiseFrame(animation)) {
            raiseAnimationFrame(animation);
            return;
        }
        if (isLoopedAnimation(animation))
            restartAnimation(animation);
    }
}
function isLoopedAnimation(animation) {
    return animation.loop;
}
function restartAnimation(animation) {
    animation.currentFrameIndex = 0;
}
function raiseAnimationFrame(animation) {
    animation.currentFrameIndex++;
}
export function getOffsetX(animation) {
    var _a;
    return ((_a = animation.offset) === null || _a === void 0 ? void 0 : _a.x) || 0;
}
export function getOffsetY(animation) {
    var _a;
    return ((_a = animation.offset) === null || _a === void 0 ? void 0 : _a.y) || 0;
}
function isTextAnimation(animation) {
    return animation.isTextAnimation;
}
function setTimeOfLastFrame(animation, timeInMs) {
    animation.timeOfLastFrame = timeInMs;
}
export function drawAnimation(animation, ctx) {
    drawAnimationAt(animation, ctx, animation.position.x, animation.position.y);
}
export function drawAnimationAt(animation, ctx, x, y) {
    if (animation.image) {
        const curFrame = animation.frames[animation.currentFrameIndex];
        ctx.drawImage(animation.image, curFrame.srcX, curFrame.srcY, curFrame.width || animation.width, curFrame.height || animation.height, x, y, curFrame.width || animation.width, curFrame.height || animation.height);
        return;
    }
    if (animation.text) {
        ctx.fillStyle = animation.fillStyle || DEFAULT_FILL_STYLE;
        ctx.font = animation.font || DEFAULT_FONT;
        ctx.fillText(animation.text.substring(0, animation.currentFrameIndex), x, y);
    }
}
export function testAnimation() {
    const test = createAnimation("PlayerIdle", "./resources/link.png", { x: 100, y: 100 }, 16, 16, [{ srcX: 62, srcY: 0 }], 6, false);
}
function canRaiseFrame(animation) {
    return isTextAnimation(animation)
        ? (animation.currentFrameIndex < animation.textFrames.length)
        : (animation.currentFrameIndex < animation.frames.length - 1);
}
function raiseDisplayedLetterCount(textAnimation) {
    if (textAnimation.currentFrameIndex < textAnimation.textFrames.length) {
        //playSound(SOUND.TEXT_SLOW);
        textAnimation.currentFrameIndex++;
        return;
    }
    if (textAnimation.loop)
        textAnimation.currentFrameIndex = 0;
}
export function addAnimation(gameObject, animation, isCurrentAnimation = false) {
    if (!gameObject.animations)
        gameObject.animations = new Map();
    gameObject.animations.set(animation.name, animation);
    if (isCurrentAnimation)
        setCurrentAnimation(gameObject, animation);
}
export function getAnimation(gameObject, key) {
    var _a;
    return ((_a = gameObject.animations) === null || _a === void 0 ? void 0 : _a.get(key)) || gameObject.defaultAnimation || Object.assign({}, NULL_ANIMATION);
}
export function setCurrentAnimation(gameObject, animation) {
    gameObject.currentAnimation = animation;
}
