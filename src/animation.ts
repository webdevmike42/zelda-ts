import { GameObject } from "./gameObjects/gameObject.js";
import { MS_PER_SECOND } from "./Global.js";
import { readyForNextFrame } from "./utils.js";
import { NULL_VECTOR, Vector } from "./vector.js";

interface Frame {
    srcX: number,
    srcY: number
}

export interface Animation {
    name: string,
    image: HTMLImageElement,
    position: Vector,
    width: number,
    height: number,
    frames: Frame[],
    framesPerSecond: number,
    loop: boolean,
    currentFrameIndex: number,
    timeOfLastFrame: number
}

const NULL_FRAME: Frame = { srcX: 0, srcY: 0 };
export const NULL_ANIMATION: Animation = Object.freeze(createAnimation("NULL_ANIMATION", "", { ...NULL_VECTOR }, 0, 0, [{...NULL_FRAME}], 0, false));


export function createAnimation(uniqueName: string, imageSrc: string, position: Vector, width: number, height: number, frames: Frame[], framesPerSecond: number, loop: boolean): Animation {
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
        framesPerSecond: framesPerSecond,
        loop: loop,
        currentFrameIndex: 0,
        timeOfLastFrame: 0
    };
}

export function updateAnimation(animation: Animation, currentGameTime: number): void {
    if (readyForNextFrame(currentGameTime, animation.timeOfLastFrame, animation.framesPerSecond)) {

        /*
                if (isTextAnimation(animation))
                    raiseDisplayedLetterCount(animation)
                else
        */
        raiseAnimationFrame(animation);
        setTimeOfLastFrame(animation, currentGameTime);
    }
}

function setTimeOfLastFrame(animation: Animation, timeInMs: number): void {
    animation.timeOfLastFrame = timeInMs;
}

export function drawAnimation(animation: Animation, ctx: CanvasRenderingContext2D) {
    const curFrame: Frame = animation.frames[animation.currentFrameIndex]
    ctx.drawImage(animation.image, curFrame.srcX, curFrame.srcY, animation.width, animation.height, animation.position.x, animation.position.y, animation.width, animation.height);
}

export function testAnimation() {
    const test: Animation = createAnimation("PlayerIdle", "./resources/link.png",
        { x: 100, y: 100 }, 16, 16, [{ srcX: 62, srcY: 0 }], 6, false);
}

function raiseAnimationFrame(animation: Animation) {
    if (animation.currentFrameIndex < animation.frames.length - 1) {
        animation.currentFrameIndex++;
        return;
    }

    if (animation.loop)
        animation.currentFrameIndex = 0;
}

export function addAnimation(gameObject: GameObject, animation: Animation): void {
    gameObject.animations?.set(animation.name, animation);
}

export function getAnimation(gameObject: GameObject, key: string): Animation {
    return gameObject.animations?.get(key) || gameObject.defaultAnimation || { ...NULL_ANIMATION };
}

export function setCurrentAnimation(gameObject: GameObject, animation: Animation): void {
    gameObject.currentAnimation = animation;
}