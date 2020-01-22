import Coordinates from "../coordinates";
import Crs from "./crs";

export const EARTH_RADIUS = 6371000;

abstract class CrsEarth extends Crs {
    protected wrapLongitude = [-180, 180];

    public distance(first: Coordinates, second: Coordinates) {
        const sinLatitudeDifference = Math.sin(
            (second.getLatitude() - first.getLatitude()) / 2
        );
        const sinLongitudeDifference = Math.sin(
            (second.getLongitude() - first.getLongitude()) / 2
        );

        const a = Math.pow(sinLatitudeDifference, 2) +
            Math.cos(first.getLatitude()) *
            Math.cos(second.getLatitude()) *
            Math.pow(sinLongitudeDifference, 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}

export default CrsEarth;
