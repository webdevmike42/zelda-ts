import { NULL_ANIMATION } from "../animation.js";
export var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["PLAYER"] = 0] = "PLAYER";
    GameObjectType[GameObjectType["ITEM"] = 1] = "ITEM";
    GameObjectType[GameObjectType["CONVEYOR"] = 2] = "CONVEYOR";
    GameObjectType[GameObjectType["DUMMY"] = 3] = "DUMMY";
})(GameObjectType || (GameObjectType = {}));
export function getCurrentAnimation(gameObject) {
    return gameObject.currentAnimation || gameObject.defaultAnimation || Object.assign({}, NULL_ANIMATION);
}
export function setCurrentAnimation(gameObject, animation) {
    gameObject.currentAnimation = animation;
}
