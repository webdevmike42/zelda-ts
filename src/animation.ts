import { GameObject } from "./gameObjects/gameObject.js";
import { readyForNextFrame } from "./utils.js";
import { NULL_VECTOR, Vector } from "./vector.js";

interface Frame {
    srcX: number,
    srcY: number,
    width?:number,
    height?:number
}

export interface Animation {
    name: string,
    image?: HTMLImageElement,
    text?: string,
    fillStyle?: string,
    font?: string,
    position: Vector,
    offset?: Vector,
    width: number,
    height: number,
    frames: Frame[],
    textFrames: string[],
    framesPerSecond: number,
    loop: boolean,
    currentFrameIndex: number,
    timeOfLastFrame: number,
    isTextAnimation: boolean
}

const NULL_FRAME: Frame = { srcX: 0, srcY: 0, width:0, height:0 };
const DEFAULT_FONT: string = "8px Arial";
const DEFAULT_FILL_STYLE: string = "black";
export const NULL_ANIMATION: Animation = Object.freeze(createAnimation("NULL_ANIMATION", "", { ...NULL_VECTOR }, 0, 0, [{ ...NULL_FRAME }], 0, false));


export function createAnimation(uniqueName: string, imageSrc: string, position: Vector, width: number, height: number, frames: Frame[], framesPerSecond: number, loop: boolean, offset?: Vector): Animation {
    return {
        name: uniqueName,
        image: (() => {
            const image = new Image();
            image.src = imageSrc;
            return image;
        })(),
        position: { ...position },
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

export function createTextAnimation(uniqueName: string, animationText: string, fillStyle: string, font: string, position: Vector, width: number, height: number, framesPerSecond: number, loop: boolean, offset?: Vector): Animation {
    return {
        name: uniqueName,
        text: animationText,
        fillStyle: fillStyle,
        font: font,
        position: { ...position },
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

export function updateAnimation(animation: Animation, currentGameTime: number): void {
    if (readyForNextFrame(currentGameTime, animation.timeOfLastFrame, animation.framesPerSecond)) {
        setTimeOfLastFrame(animation, currentGameTime);

        if (canRaiseFrame(animation)){
            raiseAnimationFrame(animation);
            return;
        }
        
        if (isLoopedAnimation(animation))
            restartAnimation(animation);    
    }
}

function isLoopedAnimation(animation: Animation): boolean {
    return animation.loop;
}

function restartAnimation(animation: Animation): void {
    animation.currentFrameIndex = 0;
}

function raiseAnimationFrame(animation: Animation): void {
    animation.currentFrameIndex++;
}

export function getOffsetX(animation: Animation): number {
    return animation.offset?.x || 0;
}

export function getOffsetY(animation: Animation): number {
    return animation.offset?.y || 0;
}

function isTextAnimation(animation: Animation): boolean {
    return animation.isTextAnimation;
}

function setTimeOfLastFrame(animation: Animation, timeInMs: number): void {
    animation.timeOfLastFrame = timeInMs;
}

export function drawAnimation(animation: Animation, ctx: CanvasRenderingContext2D): void {
    drawAnimationAt(animation, ctx, animation.position.x, animation.position.y);
}

export function drawAnimationAt(animation: Animation, ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (animation.image) {
        const curFrame: Frame = animation.frames[animation.currentFrameIndex]
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
    const test: Animation = createAnimation("PlayerIdle", "./resources/link.png",
        { x: 100, y: 100 }, 16, 16, [{ srcX: 62, srcY: 0 }], 6, false);
}

function canRaiseFrame(animation: Animation): boolean {
    return isTextAnimation(animation)
        ? (animation.currentFrameIndex < animation.textFrames.length)
        : (animation.currentFrameIndex < animation.frames.length - 1);
}

function raiseDisplayedLetterCount(textAnimation: Animation): void {
    if (textAnimation.currentFrameIndex < textAnimation.textFrames.length) {
        //playSound(SOUND.TEXT_SLOW);
        textAnimation.currentFrameIndex++;
        return;
    }

    if (textAnimation.loop)
        textAnimation.currentFrameIndex = 0;
}

export function addAnimation(gameObject: GameObject, animation: Animation, isCurrentAnimation: boolean = false): void {
    if (!gameObject.animations)
        gameObject.animations = new Map<string, Animation>();
    gameObject.animations.set(animation.name, animation);
    if (isCurrentAnimation)
        setCurrentAnimation(gameObject, animation);
}

export function getAnimation(gameObject: GameObject, key: string): Animation {
    return gameObject.animations?.get(key) || gameObject.defaultAnimation || { ...NULL_ANIMATION };
}

export function setCurrentAnimation(gameObject: GameObject, animation: Animation): void {
    gameObject.currentAnimation = animation;
}