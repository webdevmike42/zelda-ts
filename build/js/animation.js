import { readyForNextFrame } from "./utils.js";
import { NULL_VECTOR } from "./vector.js";
export const NULL_ANIMATION = Object.freeze(createAnimation("NULL_ANIMATION", "", Object.assign({}, NULL_VECTOR), 0, 0, [], 0, false));
export function createAnimation(uniqueName, imageSrc, position, width, height, frames, framesPerSecond, loop) {
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
        framesPerSecond: framesPerSecond,
        loop: loop,
        currentFrameIndex: 0,
        timeOfLastFrame: 0
    };
}
export function updateAnimation(animation, currentGameTime) {
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
function setTimeOfLastFrame(animation, timeInMs) {
    animation.timeOfLastFrame = timeInMs;
}
export function drawAnimation(animation, ctx) {
    const curFrame = animation.frames[animation.currentFrameIndex];
    ctx.drawImage(animation.image, curFrame.srcX, curFrame.srcY, animation.width, animation.height, animation.position.x, animation.position.y, animation.width, animation.height);
}
export function testAnimation() {
    const test = createAnimation("PlayerIdle", "./resources/link.png", { x: 100, y: 100 }, 16, 16, [{ srcX: 62, srcY: 0 }], 6, false);
}
function raiseAnimationFrame(animation) {
    if (animation.currentFrameIndex < animation.frames.length - 1) {
        animation.currentFrameIndex++;
        return;
    }
    if (animation.loop)
        animation.currentFrameIndex = 0;
}
