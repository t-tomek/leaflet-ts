import Map from "../../map";
import Point from "../../geometry/point";
import {
    gridLayerOptions,
    default as GridLayer,
} from "./gridLayer";
import {
    template
} from "../../core/utils";

type tileLayerOptions = {
    crossOrigin: boolean;
    detectRetina: boolean;
    errorTileUrl: string;
    maxZoom: number;
    subdomains: string;
    tms: boolean;
    zoomOffset: number;
    zoomReverse: boolean;
    minZoom: number;
};

type tile = {
    url: string;
    offset: Point;
};

class TileLayer extends GridLayer {
    constructor(private url = "", options:  Partial<gridLayerOptions & tileLayerOptions> = {}) {
        super(options);

        this.options = Object.assign({}, this.options, {
            crossOrigin: false,
            detectRetina: false,
            errorTileUrl: "",
            maxZoom: 18,
            minZoom: 0,
            subdomains: "",
            tms: false,
            zoomOffset: 0,
            zoomReverse: false,
        }, options);
    };

    public createTile(point: Point, zoom: number, offset: Point): tile {
        return {
            url: this.getTileUrl(point, zoom),
            offset,
        };
    };

    public getTileUrl(point: Point, zoom: number) {
        const data = {
            x: point.getX(),
            y: point.getY(),
            z: zoom,
        };

        return template(this.url, data);
    };

    public render() {
        return {
            type: "layer",
            size: this.gridSize,
            offset: this.gridOffset,
            tiles: this.tiles,
        };
    };
}

export default TileLayer;
