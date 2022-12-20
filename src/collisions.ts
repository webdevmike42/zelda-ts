import { Box } from "./box";

export function getCollidingBoxes(box1:Box, boxArray: Box[]) : Box[] {
    return boxArray.filter(box => boxesOverlap(box1,box));
}

export function boxOverlapSome(box1:Box, boxArray: Box[]) : boolean {
    return boxArray.some(box => boxesOverlap(box1,box));
}

export function boxesOverlap(box1:Box, box2:Box) : boolean {
    return (box1.position.x < box2.position.x + box2.width &&
        box1.position.x + box1.width > box2.position.x &&
        box1.position.y < box2.position.y + box2.height &&
        box1.position.y + box1.height > box2.position.y);
}

//export function filterBoxes

/*
export function getResolvedSolidCollisionVector(gameObject, diffVector) {
    let collidedSolidObjects = getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), gameObjects);

    if (collidedSolidObjects.length === 0)
        return diffVector;

    diffVector = getResolved8DirectionVector(getCornerCollisions(getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects), diffVector);

    return getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects).length === 0
        ? diffVector
        : NULL_VECTOR;
}

export function getCollidingSolidGameObjects(gameObject, collisionBox, gameObjectsArray) {
    return getCollidingGameObjects(gameObject, collisionBox, gameObjectsArray).filter(obj => obj.solid);
}

export function getCollidingGameObjects(gameObject, collisionBox, gameObjectsArray) {
    if (!hasCollisionsEnabled(gameObject))
        return [];

    return gameObjectsArray.filter(testObj => gameObject.id !== testObj.id
        && hasCollisionsEnabled(testObj)
        && boxesOverlap(collisionBox, getCollisionBox(testObj)));
}

export function getProspectedCollisionBox({ position, width, height }, diffVector) {
    return {
        position: getVectorSum(position, diffVector),
        width: width,
        height: height
    }
}

function getResolved8DirectionVector(cornerCollisions, diffVector) {

    let topleft = cornerCollisions.topleft,
        topright = cornerCollisions.topright,
        bottomleft = cornerCollisions.bottomleft,
        bottomright = cornerCollisions.bottomright,
        diffX = diffVector.x,
        diffY = diffVector.y;

    if (diffY < 0 && diffX !== 0 && (topleft || topright) && !(bottomleft || bottomright)) {
        diffY = 0;
    }

    if (diffY > 1 && diffX !== 0 && (bottomleft || bottomright) && !(topleft || topright)) {
        diffY = 0;
    }

    if (diffY !== 0 && diffX > 0 && (topright || bottomright) && !(topleft || bottomleft)) {
        diffX = 0;
    }

    if (diffY !== 0 && diffX < 0 && (topleft || bottomleft) && !(topright || bottomright)) {
        diffX = 0;
    }

    return {
        x: diffX,
        y: diffY
    }
}

function getCornerCollisions(collisionBox, objectArray) {
    return {
        topleft: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x, collisionBox.position.y, getCollisionBox(obj))),
        topright: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x + collisionBox.width, collisionBox.position.y, getCollisionBox(obj))),
        bottomleft: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x, collisionBox.position.y + collisionBox.height, getCollisionBox(obj))),
        bottomright: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x + collisionBox.width, collisionBox.position.y + collisionBox.height, getCollisionBox(obj)))
    }
}

export function getCollidingBoxes(anyBox, boxArray) {
    const collidingBoxes = [];
    for (let box of boxArray) {
        if (boxesOverlap(anyBox, box)) {
            collidingBoxes.push(box);
        }
    }
    return collidingBoxes;
}

export function setCollidingGameObjects(gameObject, collidingGameObjectArray){
if(gameObject && gameObject.collision && collidingGameObjectArray)
    gameObject.collision.collidingGameObjects = collidingGameObjectArray;
}


export function getCollidingHitBoxes(hurtBox, enabledOnly = true) {
    if(hurtBox){
        const test = getCollidingBoxes(hurtBox, getGameHitBoxes().filter(hb => hb.enabled || !enabledOnly));
        //console.log(test);
        return test;
    }
    return []//hurtBox !== undefined ? getCollidingBoxes(hurtBox, getGameHitBoxes()) : [];
}

function pointCollidedWithCollisionBox(x, y, collisionBox) {
    return boxesOverlap({ position: { x: x, y: y }, width: 1, height: 1 }, collisionBox);
}
export function boxesOverlap(box1, box2) {
    if (!(box1 && box2)) return false;

    return (box1.position.x < box2.position.x + box2.width &&
        box1.position.x + box1.width > box2.position.x &&
        box1.position.y < box2.position.y + box2.height &&
        box1.position.y + box1.height > box2.position.y);
}

export function addCollisionToGameObject(gameObject, collisionDto) {
    if (gameObject)
        gameObject.collision = collisionDto;
    return gameObject;
}

export function createCollisionDto({ position = { x: 0, y: 0 }, width = 0, height = 0 }, collisionCells = [], collisionsEnabled = true) {    
    return {
        collisionBox: {
            position: {...position},
            width: width,
            height: height
        },
        collidingGameObjects: [],
        collisionCells: [...collisionCells],
        lastTickCollisionResult: {},
        collisionResult: {},
        collisionsEnabled: collisionsEnabled
    }
}

export function setCollisionsEnabled(gameObject, collisionsEnabled) {
    if (gameObject?.collision)
        gameObject.collision.collisionsEnabled = collisionsEnabled;
}

export function hasCollisionsEnabled(gameObject) {
    return gameObject?.collision?.collisionsEnabled;
}

export function testCollisionModule() {
    testCheckSolidCollisions();
    testGetCollidingGameObjects();
    testGetProspectedCollisionBox();
}

function testGetCollidingGameObjects() {
    const result = [];

    const testObject0 = { id: 0 },
        testObject1 = { id: 1 },
        testObject2 = { id: 2 };

    const testArray =
        [
            addCollisionToGameObject(testObject0, createCollisionDto({ position: { x: 0, y: 0 }, width: 10, height: 10 })),
            addCollisionToGameObject(testObject1, createCollisionDto({ position: { x: 11, y: 11 }, width: 10, height: 10 })),
            addCollisionToGameObject(testObject2, createCollisionDto({ position: { x: 5, y: 5 }, width: 10, height: 10 }))
        ];

    result.push(getCollidingGameObjects(testObject0, getCollisionBox(testObject0), testArray).length === 1);

    result.push(getCollidingGameObjects(testObject1, getCollisionBox(testObject1), testArray).length === 1);

    result.push(getCollidingGameObjects(testObject2, getCollisionBox(testObject2), testArray).length === 2);

    setCollisionsEnabled(testObject0, false);
    result.push(getCollidingGameObjects(testObject2, getCollisionBox(testObject2), testArray).length === 1);
    setCollisionsEnabled(testObject0, true);
    result.push(getCollidingGameObjects(testObject2, getCollisionBox(testObject2), testArray).length === 2);

    addResult("testGetCollidingGameObjects:", result);
}

function testGetProspectedCollisionBox() {
    const result = [];
    const collisionBox = {
        position: { x: 0, y: 10 },
        width: 10,
        height: 10
    };
    const diffVector = { x: 5, y: -5 };
    const prospectedCollisionBox = getProspectedCollisionBox(collisionBox, diffVector);
    result.push(prospectedCollisionBox.position.x === 5 && prospectedCollisionBox.position.y === 5);
    addResult("testGetProspectedCollisionBox:", result);

}

function testCheckSolidCollisions() {
    const result = [];

    const player = createPlayer(100, 100);
    addCollisionToGameObject(player, createCollisionDto(player))

    const solid = createSolidDummy(90, 90, 11, 11);
    const nonSolid = createSolidDummy(100, 100, 10, 10);
    nonSolid.solid = false;

    console.log(getCollisionBox(player))
    console.log(getCollisionBox(solid))
    console.log(getCollisionBox(nonSolid))
    console.log(getCollidingGameObjects(player, player, gameObjects));
    console.log(getCollidingSolidGameObjects(player, player, gameObjects));




    
    
        let cornerCollisions;
        const testObject0 = { id: 0 },
            testObject1 = { id: 1 },
            testObject2 = { id: 2 };
        const testArray =
            [
                addCollisionToGameObject(testObject0, createCollisionDto({ position: { x: 10, y: 10 }, width: 10, height: 10 })),
            ];
    
        cornerCollisions = checkSolidCollisions(getCollisionBox(testObject0), testObject0.id, testArray);
        result.push(cornerCollisions.topleft === false && cornerCollisions.topright === false && cornerCollisions.bottomleft === false && cornerCollisions.bottomright === false);
    
        testArray.push(addSolidToGameObject(addCollisionToGameObject(testObject1, createCollisionDto({ position: { x: 0, y: 0 }, width: 9, height: 9 }))));
    
        cornerCollisions = checkSolidCollisions(getCollisionBox(testObject0), testObject0.id, testArray);
        result.push(cornerCollisions.topleft === false && cornerCollisions.topright === false && cornerCollisions.bottomleft === false && cornerCollisions.bottomright === false);
    
        addCollisionToGameObject(testObject1, createCollisionDto({ position: { x: 0, y: 0 }, width: 12, height: 9 }))
        cornerCollisions = checkSolidCollisions(getCollisionBox(testObject0), testObject0.id, testArray);
        result.push(cornerCollisions.topleft === false && cornerCollisions.topright === false && cornerCollisions.bottomleft === false && cornerCollisions.bottomright === false);
    
        console.log(cornerCollisions)
        
        
    addResult("testCheckSolidCollisions:", result);
}
*/