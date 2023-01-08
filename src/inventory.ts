import { Player } from "./gameActors/player.js";
import { Item, ItemType } from "./gameObjects/item.js";

export function addToInventory(player: Player, item: Item): void {
    if (item.itemType === ItemType.SWORD)
        player.hasSword = true;
}