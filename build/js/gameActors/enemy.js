import { doDamage, GameObjectType, isGameObjectDead } from "../gameObjects/gameObject.js";
import { CommonStateTypes, createEmptyHitState, getState, proposeDesignatedState } from "../state.js";
export function createEnemyHitState(enemy) {
    const state = createEmptyHitState();
    let hitBox;
    state.name = "enemy hit state";
    state.init = (hitBoxArg) => {
        hitBox = hitBoxArg;
    };
    state.update = () => {
        console.log("ABCDE" + hitBox.owner.name);
        if (!isHitByPlayer(hitBox) || isHitBoxOfOwnBullet(enemy, hitBox)) {
            proposeDesignatedState(enemy, getState(enemy, CommonStateTypes.IDLE));
            return;
        }
        doDamage(enemy, hitBox.damage);
        proposeDesignatedState(enemy, getState(enemy, isGameObjectDead(enemy) ? CommonStateTypes.DEATH : CommonStateTypes.IDLE));
    };
    return state;
}
function isHitByPlayer(hitBox) {
    return hitBox.owner.type === GameObjectType.PLAYER;
}
export function isHitBoxOfOwnBullet(goriya, hitBox) {
    if (hitBox.owner.type === GameObjectType.BULLET) {
        const bullet = hitBox.owner;
        return bullet.owner === goriya;
    }
    return false;
}
