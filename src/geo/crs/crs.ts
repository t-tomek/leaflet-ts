import Bounds from "../../geometry/bounds";
import Coordinates from "../coordinates";
import CoordinatesBounds from "../coordinatesBounds";
import Point from "../../geometry/point";
import ProjectionInterface from "../projection/projectionInterface";
import TransformationInterface from "../../geometry/transformationInterface";
import {
    wrapNum,
} from "../../core/utils";

abstract class Crs {
    protected abstract code: string;
    protected abstract projection: ProjectionInterface;
    protected abstract transformation: TransformationInterface;
    protected infinite = false;
    protected wrapLatitude: number[] | undefined = undefined;
    protected wrapLongitude: number[] | undefined = undefined;

    public coordinatesToPoint(coordinates: Coordinates, zoom: number) {
        const scale = this.scale(zoom);
        const projectedPoint = this.projection.project(coordinates);

        return this.transformation.transform(projectedPoint, scale);
    };

    public pointToCoordinates(point: Point, zoom: number) {

        const scale = this.scale(zoom);
        const untransformedPoint = this.transformation.untransform(point, scale);

        return this.projection.unproject(untransformedPoint);
    };

    public project(coordinates: Coordinates) {
        return this.projection.project(coordinates);
    };

    public unproject(point: Point) {
        return this.projection.unproject(point);
    };

    public scale(zoom: number) {
        return 256 * Math.pow(2, zoom);
    };

    public zoom(scale: number) {
        return Math.log(scale / 256) / Math.LN2;
    };

    public getProjectedBounds(zoom: number) {
        if (this.infinite) {
            return new Bounds([
                new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
                new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
            ]);
        }

        const scale = this.scale(zoom);
        const min = this.transformation.transform(
            this.projection.bounds.getMin(),
            scale
        );
        const max = this.transformation.transform(
            this.projection.bounds.getMax(),
            scale
        );

        return new Bounds([min, max]);
    };

    public abstract distance(first: Coordinates, second: Coordinates): number;

    public wrapCoordinates(coordinates: Coordinates) {
        const latitude = (this.wrapLatitude === undefined) ?
            coordinates.getLatitude() :
            wrapNum(coordinates.getLatitude(), this.wrapLatitude, true)
        ;
        const longitude = (this.wrapLongitude === undefined) ?
            coordinates.getLongitude() :
            wrapNum(coordinates.getLongitude(), this.wrapLongitude, true)
        ;

        return new Coordinates(latitude, longitude, coordinates.getAltitude());
    };

    public wrapCoordinatesBounds(coordinatesBounds: CoordinatesBounds) {
        const center = coordinatesBounds.getCenter();
        const wrappedCenter = this.wrapCoordinates(center);

        if (center.isEqual(wrappedCenter)) {
            return coordinatesBounds;
        }

        const shift = center.subtract(wrappedCenter);
        const northEastCoordinates = coordinatesBounds
            .getNorthEast()
            .subtract(shift);
        const southWestCoordinates = coordinatesBounds
            .getSouthWest()
            .subtract(shift);

        return new CoordinatesBounds([
            northEastCoordinates,
            southWestCoordinates,
        ]);
    };
}

export default Crs;
