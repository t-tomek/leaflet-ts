import Point from "./point";

class Bounds {
    private min = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    private max = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    constructor(private points: Point[]) {
        points.forEach((point) => {
            this.min
                .setX(Math.min(this.min.getX(), point.getX()))
                .setY(Math.min(this.min.getY(), point.getY()))
            ;
            this.max
                .setX(Math.max(this.max.getX(), point.getX()))
                .setY(Math.max(this.max.getY(), point.getY()))
            ;
        });
    };

    public getCenter() {
        return new Point(
            (this.min.getX() + this.max.getX()) / 2,
            (this.min.getY() + this.max.getY()) / 2
        );
    };

    public getMin() {
        return new Point(
            this.min.getX(),
            this.min.getY()
        );
    };

    public getMax() {
        return new Point(
            this.max.getX(),
            this.max.getY()
        );
    };

    public getBottomLeft() {
        return new Point(this.min.getX(), this.max.getY());
    };

    public getBottomRight() {
        return this.max;
    };

    public getTopLeft() {
        return this.min;
    };

    public getTopRight() {
        return new Point(this.max.getX(), this.min.getY());
    };

    public getSize() {
        return this.max.subtract(this.min);
    };
}

export default Bounds;
