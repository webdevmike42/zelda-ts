import { addAnimation, createAnimation, getAnimation, setCurrentAnimation } from "../animation.js";
import { setCollisionBoxFromBoundingBox } from "../collisions.js";
import { setHitBoxFromBoundingBox } from "../hitbox.js";
import { createVector } from "../vector.js";
import { GameObjectType, getPosition, setBounds, setPosition } from "./gameObject.js";
import { createGameObject } from "./gameObjectFactory.js";
export function createStaticHazard(x, y, width, height, damage) {
    const staticHazard = createGameObject(GameObjectType.HAZARD);
    setPosition(staticHazard, createVector(x, y));
    setBounds(staticHazard, width, height);
    setCollisionBoxFromBoundingBox(staticHazard);
    setHitBoxFromBoundingBox(staticHazard, damage);
    addAnimation(staticHazard, createAnimation("StaticHazardActive", "./resources/link.png", getPosition(staticHazard), staticHazard.width, staticHazard.height, [{ srcX: 180, srcY: 151 }], 1, false));
    setCurrentAnimation(staticHazard, getAnimation(staticHazard, "StaticHazardActive"));
    return staticHazard;
}
/*
function addTeleporterStates(teleporter: Hazard): void {
    const activeState: State = createTeleporterActiveState(teleporter);
    addState(teleporter, TeleporterStates.ACTIVE, activeState);
    setDefaultState(teleporter, activeState);
}

function addTeleporterAnimations(teleporter: Hazard): void {
    teleporter.animations = new Map<string, Animation>();
    addAnimation(teleporter, createAnimation("TeleporterActive", "./resources/link.png", getPosition(teleporter), teleporter.width, teleporter.height, [{ srcX: 0, srcY: 30 }], 1, false));
    setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
}

function createTeleporterActiveState(teleporter: Hazard): State {
    const state: State = createEmptyState();
    state.name = "teleporter active state";
    state.enter = () => {
        console.log("enter: " + state.name)
        setCurrentAnimation(teleporter, getAnimation(teleporter, "TeleporterActive"));
    }
    state.update = () => {
        getCollidingGameObjects(teleporter, getCollisionBox(teleporter), filterGameObjects(GameObjectType.PLAYER, getGameObjects()))
            .forEach(gameObject => {
                teleport(gameObject, teleporter.targetScreenId, teleporter.targetX, teleporter.targetY);
            });
    }
    state.exit = () => {
        console.log("exit " + state.name)
    };
    return state;
}

export function teleport(gameObject: GameObject, targetScreenId: number, targetX: number | undefined, targetY: number | undefined) {
    switchToScreen(targetScreenId);
    setGameObjectPosition(gameObject, createVector(targetX || getPosition(gameObject).x, targetY || getPosition(gameObject).y));
}
*/ 