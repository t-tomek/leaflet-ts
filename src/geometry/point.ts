class Point {
    constructor(private x: number, private y: number, round: boolean = false) {
        if (round) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    }

    public getX() {
        return this.x;
    }

    public getXRad() {
        return this.x;
    }

    public getXDeg() {
        return this.x * 180 / Math.PI;
    }

    public getY() {
        return this.y;
    }

    public getYRad() {
        return this.y;
    }

    public getYDeg() {
        return this.y * 180 / Math.PI;
    }

    public setX(x: number) {
        this.x = x;

        return this;
    }

    public setY(y: number) {
        this.y = y;

        return this;
    }

    public add(point: Point) {
        return new Point(
            this.x + point.x,
            this.y + point.y
        );
    }

    public subtract(point: Point) {
        return new Point(
            this.x - point.x,
            this.y - point.y
        );
    }

    public multiply(point: Point) {
        return new Point(
            this.x * point.x,
            this.y * point.y
        );
    }

    public multiplyBy(factor: number) {
        return new Point(
            this.x * factor,
            this.y * factor
        );
    }


    public divideBy(factor: number) {
        return new Point(
            this.x / factor,
            this.y / factor
        );
    }

    public scaleBy(point: Point) {
        return new Point(this.x * point.x, this.y * point.y);
    };

    public unscaleBy(point: Point) {
        return new Point(this.x / point.x, this.y / point.y);
    };

    public distanceTo(point: Point) {
        return Math.sqrt(
            Math.pow(point.x - this.x, 2) +
            Math.pow(point.y - this.y, 2)
        );
    };

    public isEqual(point: Point) {
        return this.x === point.x &&
            this.y === point.y;
    }

    public abs() {
        return new Point(
            Math.abs(this.x),
            Math.abs(this.y)
        );
    }

    public ceil() {
        return new Point(
            Math.ceil(this.x),
            Math.ceil(this.y)
        );
    }

    public floor() {
        return new Point(
            Math.floor(this.x),
            Math.floor(this.y)
        );
    }

    public trunc() {
        return new Point(
            Math.trunc(this.x),
            Math.trunc(this.y),
        );
    };

    public round() {
        return new Point(
            Math.round(this.x),
            Math.round(this.y),
        );
    }
}

export default Point;
