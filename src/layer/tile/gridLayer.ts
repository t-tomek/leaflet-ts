import Bounds from "../../geometry/bounds";
import Coordinates from "../../geo/coordinates";
import Layer from "../layer";
import Map from "../../map";
import Point from "../../geometry/point";
import {
    range
} from "../../core/utils";

export type gridLayerOptions = {
    keepBuffer: number;
    maxNativeZoom: number;
    maxZoom: number;
    minNativeZoom: number;
    minZoom: number;
    tileSize: number;
    zIndex: number;
};

abstract class GridLayer extends Layer {
    protected options: gridLayerOptions = {
        keepBuffer: 2,
        maxNativeZoom: Number.POSITIVE_INFINITY,
        maxZoom: Number.POSITIVE_INFINITY,
        minNativeZoom: Number.NEGATIVE_INFINITY,
        minZoom: Number.NEGATIVE_INFINITY,
        tileSize: 256,
        zIndex: 1,
    };
    protected isLoading = false;
    protected map: Map = new Map({});
    protected tiles: any;
    protected gridSize: Bounds = new Bounds([]);
    protected gridOffset: Point  = new Point(0, 0);

    constructor(options: Partial<gridLayerOptions> = {}) {
        super();

        this.options = Object.assign({}, this.options,  options);
        this.tiles = {};
    };

    public getIsLoading() {
        return this.isLoading;
    }

    public getTileSize() {
        const tileSize = this.options.tileSize;

        return (typeof tileSize === "number") ?
            new Point(tileSize, tileSize) :
            tileSize
        ;
    };

    public setZIndex(zIndex: number) {
        this.options.zIndex = zIndex;
        this.updateZIndex();

        return this;
    };

    public getGridSize() {
        return this.gridSize;
    }

    public abstract createTile(point: Point, zoom: number, offset: Point): any;

    public redraw(center: Coordinates) {
        this.update(center);

        return this;
    };

    protected clampZoom(zoom: number) {
        if (zoom < this.options.minNativeZoom) {
            return this.options.minNativeZoom;
        }
        if (zoom > this.options.maxNativeZoom) {
            return this.options.maxNativeZoom;
        }

        return zoom;
    };

    protected getTiledPixelBounds(center: Coordinates) {
        const mapZoom = this.map.getZoom();
        const scale = this.map.getZoomScale(mapZoom, mapZoom);
        const pixelCenter = this.map.project(center, mapZoom).floor();
        const halfSize = this.map.getSize().divideBy(scale * 2);

        return new Bounds([
            pixelCenter.subtract(halfSize),
            pixelCenter.add(halfSize)
        ]);
    };

    protected pxBoundsToTileRange(bounds: Bounds) {
        const tileSize = this.getTileSize();

        return new Bounds([
            bounds
                .getMin()
                .unscaleBy(tileSize)
                .floor(),
            bounds
                .getMax()
                .unscaleBy(tileSize)
                .ceil()
                .subtract(
                    new Point(1, 1)
                )
        ]);
    };

    protected setView(center: Coordinates, zoom: number) {
        const tileZoom = this.clampZoom(Math.round(zoom));
    };

    protected resetView() {
        this.setView(this.map.getCenter(), this.map.getZoom());
    };

    protected updateZIndex() {
        //
    }






    private update(center: Coordinates) {
        const zoom = this.clampZoom(this.map.getZoom());

        const pixelBounds = this.getTiledPixelBounds(center);
        const tileRange = this.pxBoundsToTileRange(pixelBounds);
        const tileCenter = tileRange.getCenter();

        // const margin = this.options.keepBuffer;
        // const noPruneRange = new Bounds([
        //     tileRange.getBottomLeft().subtract(new Point(margin, -margin)),
        //     tileRange.getTopRight().add(new Point(margin, -margin))
        // ]);



        const tileRangeMin = tileRange.getMin();
        const tileRangeMax = tileRange.getMax();

        if([
            tileRangeMin.getX(),
            tileRangeMin.getY(),
            tileRangeMax.getX(),
            tileRangeMax.getY(),
        ].every(x => !Number.isFinite(x))) {
            throw new Error("Attempted to load an infinite number of tiles");
        }

        const halfSize = this.map.getSize().divideBy(2);
        const unscaledPoint = this
            .map
            .project(center, zoom)
            .unscaleBy(this.getTileSize());
        const offset = tileRangeMin
            .subtract(unscaledPoint)
            .abs()
            .scaleBy(this.getTileSize())
            .subtract(halfSize)
            .trunc();
        ;

        const queue = [];
        let i = 0;
        let j = 0;

        const tileZoom = zoom;

        for(const y of range(tileRangeMin.getY(), tileRangeMax.getY())) {
            i = 0;

            for(const x of range(tileRangeMin.getX(), tileRangeMax.getX())) {
                const point = new Point(x, y);

                const tile = this.tiles[this.tileCoordsToKey(point, tileZoom)];

                if (tile) {
                    tile.current = true;
                } else {
                    queue.push({
                        point,
                        tileZoom,
                        offset: this.getTileSize().multiply(new Point(i, j)),
                    });
                }
                ++i;
            }
            ++j;
        }

        this.gridSize = new Bounds([
            new Point(0, 0),
            this.getTileSize().multiply(new Point(i, j))
        ]);
        this.gridOffset = offset;


            queue.sort(function ({point: pointA}, {point: pointB}) {
            return pointA.distanceTo(tileCenter) - pointB.distanceTo(tileCenter);
        });

        queue.forEach((tile) => {
            this.addTile(tile);
        });

        // return {
        //     tiles,
        //     imageSize: this.getTileSize().multiply(new Point(i, j)),
        //     offset,
        // };
    };

    protected addTile({point, tileZoom, offset}: {point: Point; tileZoom: number; offset: Point}) {
        const tilePos = this.getTilePos(point);
        const key = this.tileCoordsToKey(point, tileZoom);

        const tile = this.createTile(point, tileZoom, offset);

        this.tiles[key] = {
            tile,
            tileZoom,
            point,
            current: true
        };
    };



    protected tileCoordsToKey(point: Point, zoom: number) {
        return point.getX() + ":" + point.getY() + ":" + zoom;
    };

    protected getTilePos(point: Point) {
        return point
            .scaleBy(this.getTileSize());
    };

  


}

export default GridLayer;
