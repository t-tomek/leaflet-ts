import Bounds from "../../geometry/bounds";
import Coordinates from "../coordinates";
import Point from "../../geometry/point";
import ProjectionInterface from "./projectionInterface";

const MAX_LATITUDE = 85.0511287798;
const MAX_LATITUDE_RAD = MAX_LATITUDE * Math.PI / 180;

export const EARTH_RADIUS = 6378137;

class SphericalMercator implements ProjectionInterface {
    public bounds = (() => {
        const d = EARTH_RADIUS * Math.PI;

        return new Bounds([
            new Point(-d, -d),
            new Point(d, d)
        ]);
    })();

    public project(coordinates: Coordinates) {
        const latitude = Math.max(
            Math.min(
                MAX_LATITUDE_RAD,
                coordinates.getLatitudeRad()
            ),
            -MAX_LATITUDE_RAD
        );
        const sin = Math.sin(latitude);

        return new Point(
            EARTH_RADIUS * coordinates.getLongitudeRad(),
            EARTH_RADIUS * Math.log((1 + sin) / (1 - sin)) / 2
        );
    }

    public unproject(point: Point) {
        return new Coordinates(
            (2 * Math.atan(Math.exp(point.getY() / EARTH_RADIUS)) - (Math.PI / 2)) * 180 / Math.PI,
            point.getXDeg() / EARTH_RADIUS
        );
    }
}

export default SphericalMercator;
