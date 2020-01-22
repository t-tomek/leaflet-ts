import Coordinates from "../../geo/coordinates";
import Layer from "../layer";
import Map from "../../map";
import Point from "../../geometry/point";

export type markerOptions = {
    icon: string;
};

class Marker extends Layer {
    protected options: markerOptions = {
        icon: "",
    };
    protected map: Map = new Map({});
    protected marker: Point = new Point(0, 0);
    protected markerOffset: Point = new Point(0, 0);

    constructor(protected coordinates: Coordinates, options: Partial<markerOptions> = {}) {
        super();

        this.options = Object.assign({}, this.options,  options);
    };

    public redraw(center: Coordinates) {
        this.update(center);

        return this;
    };

    public render() {
        return {
            offset: this.markerOffset.subtract((new Point(25/2, 41))).ceil(),
            src: this.options.icon,
        };

    };

    protected update(center: Coordinates) {
        this.marker = this.map.project(this.coordinates);

        const scale = 1;

        const halfSize = this.map.getSize().divideBy(scale * 2);
        const topLeft = this.map.project(center).subtract(halfSize).floor();
        
        this.markerOffset = this.marker.subtract(topLeft).trunc();
    }
} 

export default Marker;
