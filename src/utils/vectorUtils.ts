import VectorLayer from "ol/layer/Vector";
import VECTOR_LAYERS_CONFIG from "../constants/vectorLayersConfig";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

const transformToFeatureCollection = (data: any) => {
    if (data.results) {
        return {
            type: "FeatureCollection",
            features: data.results.map((result: any) => ({
                type: "Feature",
                geometry: {
                    type: result.geom.type,
                    coordinates: [result.geom.coordinates[0].map((coord: number[]) => [coord[0], coord[1]])],
                },
                properties: result,
            }))
        };
    }
    return data;
};

export const createVectorLayer = async (config: typeof VECTOR_LAYERS_CONFIG[0]) => {
    const response = await fetch(config.url);
    const data = await response.json();
    const featureCollection = transformToFeatureCollection(data);
    
    return new VectorLayer({
        source: new VectorSource({
            features: new GeoJSON().readFeatures(featureCollection, {
                dataProjection: config.dataProjection,
                featureProjection: config.featureProjection,
            }),
        }),
        style: new Style({
            fill: new Fill({ color: config.fillColor }),
            stroke: new Stroke({ color: config.strokeColor, width: config.strokeWidth })
        })
    });
};