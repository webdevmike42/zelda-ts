import { addKeys } from "./gameActors/player.js";
import { ItemType } from "./gameObjects/item.js";
export function addToInventory(player, item) {
    switch (item.itemType) {
        case ItemType.SMALL_KEY:
            console.log(player.keys);
            addKeys(item.amount);
            console.log(player.keys);
            break;
        case ItemType.SWORD:
            player.hasSword = true;
            break;
    }
}
