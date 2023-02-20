import { Bullet } from "../gameObjects/bullet.js";
import { doDamage, GameObject, GameObjectType, isGameObjectDead } from "../gameObjects/gameObject.js";
import { HitBox } from "../hitbox.js";
import { CommonStateTypes, createEmptyHitState, getState, proposeDesignatedState, State } from "../state.js";

export function createEnemyHitState(enemy: GameObject): State {
    const state: State = createEmptyHitState();
    let hitBox: HitBox;
    state.name = "enemy hit state";

    state.init = (hitBoxArg: HitBox) => {
        hitBox = hitBoxArg;
    }

    state.update = () => {
        console.log("ABCDE" + hitBox.owner.name)
        if (!isHitByPlayer(hitBox) || isHitBoxOfOwnBullet(enemy, hitBox)) {
            proposeDesignatedState(enemy, getState(enemy, CommonStateTypes.IDLE));
            return;
        }

        doDamage(enemy, hitBox.damage);
        proposeDesignatedState(enemy, getState(enemy, isGameObjectDead(enemy) ? CommonStateTypes.DEATH : CommonStateTypes.IDLE));
    }
    return state;
}

function isHitByPlayer(hitBox:HitBox):boolean{
    return hitBox.owner.type === GameObjectType.PLAYER;
}

export function isHitBoxOfOwnBullet(goriya: GameObject, hitBox: HitBox): boolean {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet: Bullet = hitBox.owner as Bullet;
        return bullet.owner === goriya;
    }
    return false;
}