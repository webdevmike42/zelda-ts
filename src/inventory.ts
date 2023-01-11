import { addKeys, Player } from "./gameActors/player.js";
import { Item, ItemType } from "./gameObjects/item.js";

export function addToInventory(player: Player, item: Item): void {
    switch (item.itemType) {
        case ItemType.SMALL_KEY:
            console.log(player.keys)
            addKeys(item.amount);
            console.log(player.keys)
            break;
        case ItemType.SWORD:
            player.hasSword = true;
            break;
    }        
}