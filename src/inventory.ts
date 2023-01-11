import { addKeys, Player } from "./gameActors/player.js";
import { setVisible } from "./gameObjects/gameObject.js";
import { Item, ItemType } from "./gameObjects/item.js";

export function addToInventory(player: Player, item: Item): void {
    switch (item.itemType) {
        case ItemType.SMALL_KEY:
            addKeys(item.amount);
            break;
        case ItemType.SWORD:
            player.hasSword = true;
            break;
    }        
    setVisible(item,false);
    item.isCollected = true;
}