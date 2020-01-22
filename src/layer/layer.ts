import Map from "../map";
import Coordinates from "../geo/coordinates";

abstract class Layer {
    public leafletId: number = 0;
    protected abstract map: Map;

    public addTo(map: Map) {
        map.addLayer(this);

        this.map = map;

        return this;
    };

    public abstract redraw(center: Coordinates): void;
    public abstract render(): any;
}

export default Layer;