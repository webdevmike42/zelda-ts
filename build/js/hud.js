let boundDrawImage;
let cursor;
const itemLookup = {};
const HEALTH_BAR_X = 176, HEALTH_BAR_Y = 217, BUTTON_A_X = 152, BUTTON_A_Y = 201, BUTTON_B_X = 128, BUTTON_B_Y = 201;
const CURSOR_START_X = 128, CURSOR_START_Y = 49, CURSOR_OFFSET_X = 24, CURSOR_OFFSET_Y = 16, CURSOR_MAX_X = 200, CURSOR_MAX_Y = 65;
const MAX_HUD_OFFSET = -169, MIN_HUD_OFFSET = 0;
let _offset = MAX_HUD_OFFSET;
export function loadHud(ctx, srcPath) {
    const hud = new Image();
    hud.src = srcPath;
    boundDrawImage = ctx.drawImage.bind(ctx, hud);
    initItemLookUpTable();
    cursor = {
        x: CURSOR_START_X,
        y: CURSOR_START_Y,
        width: 16,
        height: 16
    };
}
function drawHudImage(srcX, srcY, width, height, hudX, hudY) {
    boundDrawImage(srcX, srcY, width, height, hudX, hudY + getHudOffset(), width, height);
}
function initItemLookUpTable() {
    /*
    itemLookup[ITEM_TYPES.BOOMERANG] = {
        srcX: 584,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 132,
        hudY: 49
    };

    itemLookup[ITEM_TYPES.BOMB] = {
        srcX: 604,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 156,
        hudY: 49
    };

    itemLookup[ITEM_TYPES.ARROW] = {
        srcX: 615,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 176,
        hudY: 49
    };

    itemLookup[ITEM_TYPES.BOW] = {
        srcX: 633,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 184,
        hudY: 49
    };

    itemLookup[ITEM_TYPES.CANDLE] = {
        srcX: 653,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 204,
        hudY: 49
    };

    itemLookup[ITEM_TYPES.FLUTE] = {
        srcX: 664,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 132,
        hudY: 65
    };

    itemLookup[ITEM_TYPES.MEAT] = {
        srcX: 675,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 156,
        hudY: 65
    };

    itemLookup[ITEM_TYPES.POTION] = {
        srcX: 704,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 180,
        hudY: 65
    };

    itemLookup[ITEM_TYPES.MAGIC_ROD] = {
        srcX: 715,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 204,
        hudY: 65
    };

    itemLookup[ITEM_TYPES.RAFT] = {
        srcX: 519,
        srcY: 156,
        width: 16,
        height: 16,
        hudX: 128,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.BOOK_OF_MAGIC] = {
        srcX: 538,
        srcY: 156,
        width: 8,
        height: 16,
        hudX: 152,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.RING] = {
        srcX: 549,
        srcY: 156,
        width: 8,
        height: 16,
        hudX: 164,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.LADDER] = {
        srcX: 560,
        srcY: 156,
        width: 16,
        height: 16,
        hudX: 176,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.KEY] = {
        srcX: 579,
        srcY: 156,
        width: 8,
        height: 16,
        hudX: 196,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.BRACELET] = {
        srcX: 590,
        srcY: 156,
        width: 8,
        height: 16,
        hudX: 208,
        hudY: 25
    };

    itemLookup[ITEM_TYPES.WOOD_SWORD] = {
        srcX: 555,
        srcY: 137,
        width: 8,
        height: 16,
        hudX: 110,
        hudY: 209
    };
    */
}
/*
function getSelectedItem() {
    return getSelectedItemInfo().item;
}
*/
/*
export function getSelectedItemType() {
    return parseInt(getSelectedItemInfo().itemType);
}
*/
/*
function getSelectedItemInfo() {
    for (const item in itemLookup) {
        if (itemLookup[item].hudY === cursor.y && itemLookup[item].hudX > cursor.x && itemLookup[item].hudX < cursor.x + cursor.width) {
            return {
                itemType: item,
                item: { ...itemLookup[item] }
            };
        }
    }
    return null;
}
*/
export function createHudDtoFromGameObject(player) {
    const dto = createEmptyHudDto();
    //const inventory = getInventory(player);
    if (player) {
        dto.health = player.health || 0;
        dto.maxHealth = player.maxHealth || 0;
        dto.rupees = player.rupees;
        dto.keys = player.keys;
        dto.bombs = player.bombs;
        //dto.inventory = inventory;
        //dto.equippedItemA = getEquippedItem(inventory, ITEM_SLOTS.SLOT_A);
        //dto.equippedItemB = getEquippedItem(inventory, ITEM_SLOTS.SLOT_B);
        //dto.collectedTriforcePieces = player.collectedTriforcePieces
    }
    return dto;
}
function createEmptyHudDto() {
    return {
        health: 0,
        maxHealth: 0,
        rupees: 0,
        keys: 0,
        bombs: 0,
        //inventory: [],
        //equippedItemA: null,
        //equippedItemB: null,
        collectedTriforcePieces: []
    };
}
export function drawHUD(dto) {
    //drawInventory(dto.inventory, dto.equippedItemA, dto.equippedItemB);
    if (isPlayerInOverworld()) {
        drawTriforce(dto.collectedTriforcePieces);
    }
    else {
        drawDungeonStats();
    }
    drawHudImage(258, 11, 256, 56, 0, 177);
    drawMap();
    drawRupees(dto.rupees);
    drawKeys(dto.keys);
    drawBombs(dto.bombs);
    //drawButtons(dto.equippedItemA, dto.equippedItemB);
    drawHealthBar(dto.health, dto.maxHealth);
    // drawCursor();
}
/*
function drawInventory(inventory, equippedItemA, equippedItemB) {
    drawHudImage(1, 11, 256, 88, 0, 1)

    for (const itemType of Object.values(ITEM_TYPES)) {
        if (itemLookup[itemType] && hasItem(inventory, itemType)) {
            const item = itemLookup[itemType];
            drawHudImage(item.srcX, item.srcY, item.width, item.height, item.hudX, item.hudY);
        }
    }

    if (hasItem(inventory, getSelectedItemType()))
        drawSelectedItem();
}
*/
function drawTriforce(collectedTriForcePiecesArray) {
    drawHudImage(1, 112, 256, 88, 0, 89);
}
function drawDungeonStats() {
}
function drawMap() {
}
function drawRupees(rupees) {
    drawCounterToHud(rupees, 96, 193, 8);
}
function drawCounterToHud(num, x, y, xOffset) {
    if (num < 100)
        drawHudImage(519, 117, 8, 8, x, y);
    x += (num < 10) ? xOffset : xOffset * 2;
    do {
        drawHudDigit(num % 10, x, y);
        num = Math.floor(num / 10);
        x -= xOffset;
    } while (num > 0);
}
function drawHudDigit(digit, x, y) {
    drawHudImage(528 + (digit * 9), 117, 8, 8, x, y);
}
function drawKeys(keys) {
    drawCounterToHud(keys, 96, 209, 8);
}
function drawBombs(bombs) {
    drawCounterToHud(bombs, 96, 217, 8);
}
/*
function drawButtons(equippedItemA, equippedItemB) {
    if (equippedItemA) {
        const item = itemLookup[equippedItemA.itemType];
        drawHudImage(item.srcX, item.srcY, item.width, item.height, BUTTON_A_X, BUTTON_A_Y);
    }

    if (equippedItemB) {
        const item = itemLookup[equippedItemB.itemType];
        drawHudImage(item.srcX, item.srcY, item.width, item.height, BUTTON_B_X, BUTTON_B_Y);
    }
}
*/
/*
function drawSelectedItem() {
    const item = getSelectedItem();
    if (item !== null)
        drawHudImage(item.srcX, item.srcY, item.width, item.height, 68, 49);

}
*/
function drawHealthBar(health, maxHealth) {
    let xOffset = 8, rowOffset = -8, heartsPerRow = 8, heartsDrawn = 0, rowCount = Math.ceil(maxHealth / heartsPerRow), fullHearts = Math.floor(health), hasHalfHeart = fullHearts !== health;
    for (let row = 0; row < rowCount; row++) {
        let heartX = HEALTH_BAR_X;
        let heartY = HEALTH_BAR_Y + (row * rowOffset);
        for (let heartsDrawnCurRow = 0; heartsDrawnCurRow < heartsPerRow; heartsDrawnCurRow++) {
            if (heartsDrawn < fullHearts) {
                drawFullHeart(heartX + (heartsDrawnCurRow * xOffset), heartY);
            }
            else if (hasHalfHeart) {
                drawHalfHeart(heartX + (heartsDrawnCurRow * xOffset), heartY);
                hasHalfHeart = false;
            }
            else {
                drawEmptyHeart(heartX + (heartsDrawnCurRow * xOffset), heartY);
            }
            if ((++heartsDrawn) >= maxHealth)
                return;
        }
    }
}
function drawFullHeart(x, y) {
    drawHudImage(645, 117, 8, 8, x, y);
}
function drawEmptyHeart(x, y) {
    drawHudImage(627, 117, 8, 8, x, y);
}
function drawHalfHeart(x, y) {
    drawHudImage(636, 117, 8, 8, x, y);
}
function isPlayerInOverworld() {
    return true;
}
function getHudOffset() {
    return _offset;
}
function setHudOffset(offset) {
    _offset = offset;
}
export function moveHudUpBy(pixels) {
    setHudOffset(Math.max(getHudOffset() - pixels, MAX_HUD_OFFSET));
}
export function moveHudDownBy(pixels) {
    setHudOffset(Math.min(getHudOffset() + pixels, MIN_HUD_OFFSET));
}
export function hasHudMaxOffset() {
    return getHudOffset() === MAX_HUD_OFFSET;
}
export function hasHudMinOffset() {
    return getHudOffset() === MIN_HUD_OFFSET;
}
function drawCursor(x, y) {
    drawHudImage(536, 137, cursor.width, cursor.height, cursor.x, cursor.y);
}
export function moveCursorRight() {
    cursor.x = Math.min(cursor.x + CURSOR_OFFSET_X, CURSOR_MAX_X);
}
export function moveCursorLeft() {
    cursor.x = Math.max(cursor.x - CURSOR_OFFSET_X, CURSOR_START_X);
}
export function moveCursorUp() {
    cursor.y = Math.max(cursor.y - CURSOR_OFFSET_Y, CURSOR_START_Y);
}
export function moveCursorDown() {
    cursor.y = Math.min(cursor.y + CURSOR_OFFSET_Y, CURSOR_MAX_Y);
}
