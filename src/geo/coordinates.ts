class Coordinates {

    constructor(
        protected latitude: number,
        protected longitude: number,
        protected altitude: number | null = null
    ) {
        //
    };

    public getAltitude() {
        return this.altitude;
    }

    public getLatitude() {
        return this.latitude;
    }

    public getLatitudeDeg() {
        return this.latitude;
    }

    public getLatitudeRad() {
        return this.latitude * Math.PI / 180;
    }

    public getLongitude() {
        return this.longitude;
    }

    public getLongitudeDeg() {
        return this.longitude;
    }

    public getLongitudeRad() {
        return this.longitude * Math.PI / 180;
    }

    public setLatitude(latitude: number) {
        this.latitude = latitude;

        return this;
    }

    public setLongitude(longitude: number) {
        this.longitude = longitude;

        return this;
    }

    public add(coordinates: Coordinates) {
        return new Coordinates(
            this.latitude + coordinates.latitude,
            this.longitude + coordinates.longitude
        );
    }

    public subtract(coordinates: Coordinates) {
        return new Coordinates(
            this.latitude - coordinates.latitude,
            this.longitude - coordinates.longitude
        );
    }

    public isEqual(coordinates: Coordinates, epsilon = 1.0E-9) {
        return [
            this.latitude - coordinates.latitude,
            this.longitude - coordinates.longitude,
        ].every(x => x <= epsilon);
    }
}

export default Coordinates;
