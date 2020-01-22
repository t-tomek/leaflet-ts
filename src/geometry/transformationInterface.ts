import Point from "./point";

interface TransformationInterface {
    transform(point: Point, scale: number): Point;
    untransform(point: Point, scale: number): Point;
}

export default TransformationInterface;
