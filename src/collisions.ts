import { Box, createBox } from "./box.js";
import { GameObject, getBoundingBox, getPosition } from "./gameObjects/gameObject.js";
import { getGameObjects, isSolid } from "./gameObjects/gameObjectFactory.js";
import { addTestResult } from "./tests.js";
import { createVector, NULL_VECTOR, Vector, vectorSum } from "./vector.js";


interface CornerCollisions{
    topleft:boolean,
    topright:boolean,
    bottomleft:boolean,
    bottomright:boolean
}

function pointCollidedWithCollisionBox(x:number, y:number, collisionBox:Box) :boolean{
    return boxesOverlap({ position: createVector(x,y), width: 1, height: 1 }, collisionBox);
}

export function getCollidingGameObjects(gameObject: GameObject, collisionBox: Box, gameObjects: GameObject[]): GameObject[] {
    return gameObjects
        .filter(go => gameObject.id !== go.id && boxesOverlap(collisionBox, getCollisionBox(go)));
}

export function getCollidingSolidGameObjects(gameObject: GameObject, collisionBox: Box, gameObjects: GameObject[]): GameObject[] {
    return getCollidingGameObjects(gameObject, collisionBox, gameObjects)
        .filter(go => isSolid(go));
}

export function getCollidingBoxes(box1: Box, boxArray: Box[]): Box[] {
    return boxArray.filter(box => boxesOverlap(box1, box));
}

export function boxOverlapSome(box1: Box, boxArray: Box[]): boolean {
    return boxArray.some(box => boxesOverlap(box1, box));
}

export function boxesOverlap(box1: Box, box2: Box): boolean {
    return (box1.position.x < box2.position.x + box2.width &&
        box1.position.x + box1.width > box2.position.x &&
        box1.position.y < box2.position.y + box2.height &&
        box1.position.y + box1.height > box2.position.y);
}

export function setCollisionBox(gameobject: GameObject, collisionBox: Box): void {
    gameobject.collisionBox = { position: { ...collisionBox.position }, width: collisionBox.width, height: collisionBox.height };
}

export function setCollisionBoxFromBoundingBox(gameObject: GameObject): void {
    setCollisionBox(gameObject, getBoundingBox(gameObject));
}

export function getCollisionBox(gameObject: GameObject): Box {
    return gameObject.collisionBox;
}

export function getResolvedSolidCollisionVector(gameObject: GameObject, diffVector: Vector): Vector {
    let collidedSolidObjects = getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(gameObject, diffVector), getGameObjects());
    if (collidedSolidObjects.length === 0)
        return diffVector;

    diffVector = getResolved8DirectionVector(getCornerCollisions(getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects), diffVector);

    return getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects).length === 0
        ? diffVector
        : {...NULL_VECTOR};
}

export function getProspectedCollisionBox(collisionBox: Box, diffVector: Vector): Box {
    return {
        position: vectorSum(collisionBox.position, diffVector),
        width: collisionBox.width,
        height: collisionBox.height
    }
}

function getCornerCollisions(collisionBox:Box, objectArray:GameObject[]):CornerCollisions {
    return {
        topleft: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x, collisionBox.position.y, getCollisionBox(obj))),
        topright: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x + collisionBox.width, collisionBox.position.y, getCollisionBox(obj))),
        bottomleft: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x, collisionBox.position.y + collisionBox.height, getCollisionBox(obj))),
        bottomright: objectArray.some(obj => pointCollidedWithCollisionBox(collisionBox.position.x + collisionBox.width, collisionBox.position.y + collisionBox.height, getCollisionBox(obj)))
    }
}

export function testCollisions() {
    const box1: Box = createBox(0, 0, 10, 10);
    const boxArr: Box[] = [createBox(5, 5, 10, 10), createBox(9, 10, 10, 10), createBox(9, 9, 10, 10)];
    const boxArr2: Box[] = [createBox(10, 10, 10, 10), createBox(9, 10, 10, 10), createBox(10, 9, 10, 10)];

    addTestResult("boxesOverlap", boxesOverlap(box1, boxArr[0]) && !boxesOverlap(box1, boxArr[1]));
    addTestResult("boxOverlapSome", boxOverlapSome(box1, boxArr) && !boxOverlapSome(box1, boxArr2));
    addTestResult("getCollidingBoxes", getCollidingBoxes(box1, boxArr).length === 2 && getCollidingBoxes(box1, boxArr2).length === 0);
}


function getResolved8DirectionVector(cornerCollisions:CornerCollisions, diffVector:Vector):Vector {

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
/*
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