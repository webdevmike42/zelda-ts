import { ItemType } from "./gameObjects/item.js";
export function addToInventory(player, item) {
    if (item.itemType === ItemType.SWORD)
        player.hasSword = true;
}
