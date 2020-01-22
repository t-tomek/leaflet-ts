import Bounds from "./geometry/bounds";
import Coordinates from "./geo/coordinates";
import CoordinatesBounds from "./geo/coordinatesBounds";
import Crs from "./geo/crs/crs";
import EPSG3857 from "./geo/crs/crsEpsg3857";
import Layer from "./layer/layer";
import Point from "./geometry/point";
import {
    stamp
} from "./core/utils";

type mapOptions = {
    center: Coordinates;
    crs: Crs;
    height: number;
    maxZoom: number;
    maxBounds: CoordinatesBounds | null;
    minZoom: number;
    position: Point;
    width: number;
    zoom: number;
    zoomSnap: number;
};

type paddingOptions = {
    padding: {
        x?: number;
        y?: number;
    };
    paddingTopLeft: {
        x?: number;
        y?: number;
    };
    paddingBottomRight: {
        x?: number;
        y?: number;
    };
};

class Map {
    private options: mapOptions = {
        center:  new Coordinates(0, 0),
        crs: new EPSG3857(),
        height: 400,
        maxZoom: Number.POSITIVE_INFINITY,
        maxBounds: null,
        minZoom: 1,
        position: new Point(0, 0),
        width: 400,
        zoom: 19,
        zoomSnap: 1,
    };

    private uniqId= 1;
    private layers: {
        [id: number]: Layer;
    } = {};
    private isLoaded = false;
    private mapPanePosition = new Point(0, 0);

    constructor(options: Partial<mapOptions>) {
        this.options = Object.assign({}, this.options,  options);

        this.setView(this.options.center, this.options.zoom);
    };

    public addLayer(layer: Layer) {
        const id = stamp(layer);

        if (this.layers[id] === undefined) {
            this.layers[id] = layer;
        }

        return this;
    };

    public getBoundsZoom(
        coordinatesBounds: CoordinatesBounds,
        inside: boolean = false,
        padding = new Point(0, 0)
    ) {
        const zoom = this.getZoom();
        const bounds = new Bounds([
            this.project(coordinatesBounds.getSouthEast(), zoom),
            this.project(coordinatesBounds.getNorthWest(), zoom)
        ]);
        const boundsSize = bounds.getSize();

        const size = this.getSize().subtract(padding);
        const scaleX = size.getX() / boundsSize.getX();
        const scaleY = size.getY() / boundsSize.getY();
        const scale = (inside) ?
            Math.max(scaleX, scaleY) :
            Math.min(scaleX, scaleY)
        ;

        let boundsZoom = this.getScaleZoom(scale, zoom);
        const snap = this.getSnap();
        if (snap) {
            boundsZoom = Math.round(boundsZoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
            boundsZoom = (inside) ?
                Math.ceil(boundsZoom / snap) * snap :
                Math.floor(boundsZoom / snap) * snap
            ;
        }

        return Math.max(
            this.getMinZoom(),
            Math.min(this.getMaxZoom(), boundsZoom)
        );
    };

    public getCenter() {
        return this.layerPointToCoordinates(this.getCenterLayerPoint());
    };

    public getCenterLayerPoint() {
        return this.containerPointToLayerPoint(this.getSize().divideBy(2));
    };

    public containerPointToLayerPoint(point: Point) {
        return point.subtract(this.getMapPanePos());
    };

    public getMinZoom() {
        return this.options.minZoom;
    };

    public getMaxZoom() {
        return this.options.maxZoom;
    };

    public getScaleZoom(scale: number, fromZoom: number = this.getZoom()) {
        const zoom = this.options
            .crs
            .zoom(scale * this.options.crs.scale(fromZoom));

        return isNaN(zoom) ? Infinity : zoom;
    };

    public getSize() {
        return new Point(this.options.width, this.options.height);
    };

    public getSnap() {
        return this.options.zoomSnap;
    };

    public getZoom() {
        return this.options.zoom;
    };

    public getZoomScale(toZoom: number, fromZoom: number = this.getZoom()) {
        return this.options.crs.scale(toZoom) / this.options.crs.scale(fromZoom);
    };

    // is it useful?
    public getPixelOrigin() {
        return new Point(0, 0);
    };

    public setMapPanePosition(mapPanePosition: Point) {
        this.mapPanePosition = mapPanePosition;
    };

    public setView(atCenter: Coordinates, atZoom?: number, options = {}) {
        const zoom = (atZoom === undefined) ? this.getZoom() : this.limitZoom(atZoom);
        const center = this.limitCenter(atCenter, zoom, this.options.maxBounds);

        this.resetView(center, zoom);
        
        return this;
    }

    public setZoom(zoom: number) {
        if (this.isLoaded === false) {
            this.options.zoom = zoom;

            return this;
        }

        return this.setView(this.getCenter(), zoom);
    };

    public coordinatesToLayerPoint(coordinates: Coordinates) {
        const projectedPoint = this.project(coordinates).round();

        return projectedPoint.subtract(this.getPixelOrigin());
    };

    public fitBounds(bounds: CoordinatesBounds, options: Partial<paddingOptions> = {}) {
        const target = this.getBoundsCenterZoom(bounds, options);

        return this.setView(target.center, target.zoom, options);
    };

    public layerPointToCoordinates(point: Point) {
        return this.unproject(
            point.add(this.getPixelOrigin())
        );
    };

    public panTo(center: Coordinates) {
        return this.setView(center, this.getZoom());
    };

    public project(coordinates: Coordinates, zoom: number = this.getZoom()) {
        return this.options.crs.coordinatesToPoint(coordinates, zoom);
    };

    public unproject(point: Point, zoom: number = this.getZoom()) {
        return this.options.crs.pointToCoordinates(point, zoom);
    };

    public render() {
        return Object.values(this.layers).map((layer) => {
            return layer.render();
        });
    };

    protected getBoundsCenterZoom(
        cordinatesBounds: CoordinatesBounds,
        getBoundsCenterZoomOptions: Partial<paddingOptions & { maxZoom: number }> = {}
    ) {
        const options = Object.assign({}, {
            padding: {},
            paddingTopLeft: {},
            paddingBottomRight: {},
            maxZoom: Number.POSITIVE_INFINITY
        }, getBoundsCenterZoomOptions);

        const paddingTL = new Point(
            options.paddingTopLeft.x || options.padding.x || 0,
            options.paddingTopLeft.y || options.padding.y || 0
        );
        const paddingBR = new Point(
            options.paddingBottomRight.x || options.padding.x || 0,
            options.paddingBottomRight.y || options.padding.y || 0
        );
        const zoom = Math.min(
            options.maxZoom,
            this.getBoundsZoom(
                cordinatesBounds,
                false,
                paddingTL.add(paddingBR)
            )
        );

        if (zoom === Number.POSITIVE_INFINITY) {
            return {
                center: cordinatesBounds.getCenter(),
                zoom,
            };
        }

        const paddingOffset = paddingBR.subtract(paddingTL).divideBy(2);

        const southWestPoint = this.project(
            cordinatesBounds.getSouthWest(),
            zoom
        );
        const northEastPoint = this.project(
            cordinatesBounds.getNorthEast(),
            zoom
        );
        const center = this.unproject(
            southWestPoint
                .add(northEastPoint)
                .divideBy(2)
                .add(paddingOffset),
            zoom
        );

        return {
            center,
            zoom,
        };
    };

    protected getMapPanePos() {
        return this.mapPanePosition;
    };

    protected getBoundsOffset(pxBounds: Bounds, maxBounds: CoordinatesBounds, zoom: number) {
        const projectedMaxBounds = new Bounds([
            this.project(maxBounds.getNorthEast(), zoom),
            this.project(maxBounds.getSouthWest(), zoom)
        ]);
        
        const minOffset = projectedMaxBounds
            .getMin()
            .subtract(pxBounds.getMin());
        const maxOffset = projectedMaxBounds
            .getMax()
            .subtract(pxBounds.getMax());

        const deltaX = this.rebound(minOffset.getX(), -maxOffset.getX());
        const deltaY = this.rebound(minOffset.getY(), -maxOffset.getY());

        return new Point(deltaX, deltaY);
    };

    protected rebound(left: number, right: number) {
        return (left + right > 0) ?
            Math.round(left - right) / 2 :
            Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
    };

    protected resetView(center: Coordinates, zoom: number) {

        const limitZoom = this.limitZoom(zoom);

        Object.values(this.layers).forEach((layer) => {
            layer.redraw(center);
        });
    };

    protected limitCenter(center: Coordinates, zoom: number, bounds: CoordinatesBounds | null = null) {
        if (bounds === null) {
            return center;
        }

        const centerPoint = this.project(center, zoom);
        const viewHalf = this.getSize().divideBy(2);
        const viewBounds = new Bounds([
            centerPoint.subtract(viewHalf),
            centerPoint.add(viewHalf)
        ]);

        const offset = this.getBoundsOffset(viewBounds, bounds, zoom);
        if (offset.round().isEqual(new Point(0, 0))) {
            return center;
        }

        return this.unproject(centerPoint.add(offset), zoom);
    };

    protected limitZoom(zoom: number) {
        const snap = this.getSnap();

        const snapZoom = (snap) ?
            Math.round(zoom / snap) * snap :
            zoom;

        return Math.max(
            this.getMinZoom(),
            Math.min(this.getMaxZoom(), snapZoom)
        );
    };
}

export default Map;
