import { Box, createBox } from "./box.js";
import { GameObject, GameObjectType, getBoundingBox } from "./gameObjects/gameObject.js";
import { isSolid } from "./gameObjects/gameObjectFactory.js";
import { getCurrentGameObjects } from "./screens.js";
import { addTestResult } from "./tests.js";
import { NULL_VECTOR, Vector, vectorSum } from "./vector.js";


interface CornerCollisions {
    topleft: boolean,
    topright: boolean,
    bottomleft: boolean,
    bottomright: boolean
}

function pointCollidedWithCollisionBox(x: number, y: number, collisionBox: Box): boolean {
    return boxesOverlap(createBox(x, y, 1, 1), collisionBox);
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
    gameobject.collisionBox = createBox(collisionBox.position.x, collisionBox.position.y, collisionBox.width, collisionBox.height);
}

export function setCollisionBoxFromBoundingBox(gameObject: GameObject): void {
    setCollisionBox(gameObject, getBoundingBox(gameObject));
}

export function getCollisionBox(gameObject: GameObject): Box {
    return gameObject.collisionBox;
}

export function getResolvedSolidCollisionVector(gameObject: GameObject, diffVector: Vector): Vector {
    let collidedSolidObjects = getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(gameObject, diffVector), getCurrentGameObjects());
    gameObject.hitSolid = (collidedSolidObjects.length > 0);
    if(gameObject.type === GameObjectType.HAZARD&& collidedSolidObjects.length > 0)
    console.log(collidedSolidObjects)
   
    if (collidedSolidObjects.length === 0)
        return diffVector;

    diffVector = getResolved8DirectionVector(getCornerCollisions(getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects), diffVector);

    return getCollidingSolidGameObjects(gameObject, getProspectedCollisionBox(getCollisionBox(gameObject), diffVector), collidedSolidObjects).length === 0
        ? diffVector
        : { ...NULL_VECTOR };
}

export function getProspectedCollisionBox(collisionBox: Box, diffVector: Vector): Box {
    const propsectedPosition: Vector = vectorSum(collisionBox.position, diffVector);
    return createBox(propsectedPosition.x, propsectedPosition.y, collisionBox.width, collisionBox.height);
}

function getCornerCollisions(collisionBox: Box, objectArray: GameObject[]): CornerCollisions {
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


function getResolved8DirectionVector(cornerCollisions: CornerCollisions, diffVector: Vector): Vector {

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