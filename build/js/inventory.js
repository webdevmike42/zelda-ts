import { addKeys } from "./gameActors/player.js";
import { setVisible } from "./gameObjects/gameObject.js";
import { ItemType } from "./gameObjects/item.js";
export function addToInventory(player, item) {
    switch (item.itemType) {
        case ItemType.SMALL_KEY:
            addKeys(item.amount);
            break;
        case ItemType.SWORD:
            player.hasSword = true;
            break;
    }
    setVisible(item, false);
    item.isCollected = true;
}
