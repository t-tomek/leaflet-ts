import Coordinates from "./coordinates";

class CoordinatesBounds {
    private southWest = new Coordinates(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    private northEast = new Coordinates(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    constructor(coordinates: Coordinates[]) {
        coordinates.forEach((coordinate) => {
            this.southWest.setLatitude(Math.min(this.southWest.getLatitude(), coordinate.getLatitude()));
            this.southWest.setLongitude(Math.min(this.southWest.getLongitude(), coordinate.getLongitude()));
            this.northEast.setLatitude(Math.max(this.northEast.getLatitude(), coordinate.getLatitude()));
            this.northEast.setLongitude(Math.max(this.northEast.getLongitude(), coordinate.getLongitude()));
        });
    }

    public getCenter() {
        return new Coordinates(
            (this.southWest.getLatitude() + this.northEast.getLatitude()) / 2,
            (this.southWest.getLongitude() + this.northEast.getLongitude()) / 2
        );
    }

    public getSouthWest() {
        return this.southWest;
    }

    public getNorthEast() {
        return this.northEast;
    }

    public getNorthWest() {
        return new Coordinates(this.getNorth(), this.getWest());
    }

    public getSouthEast() {
        return new Coordinates(this.getSouth(), this.getEast());
    }

    public getWest() {
        return this.southWest.getLongitude();
    }

    public getSouth() {
        return this.southWest.getLatitude();
    }

    public getEast() {
        return this.northEast.getLongitude();
    }

    public getNorth() {
        return this.northEast.getLatitude();
    }
}

export default CoordinatesBounds;
