import { useEffect, useState, useRef, useCallback } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { Feature, Map } from "ol";
import { View } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Geometry } from "ol/geom";
import WebGLTileLayer from "ol/layer/WebGLTile";
import VECTOR_LAYERS_CONFIG from "../constants/vectorLayersConfig";
import LayerManager from './LayerManager';
import RASTER_LAYERS_CONFIG from "../constants/layersConfig";
import { createWebGLTileLayer } from "../utils/rasterUtils";

interface LayerInfo {
    id: string;
    name: string;
    layer: TileLayer<XYZ> | VectorLayer<VectorSource<Feature<Geometry>>> | WebGLTileLayer;
    visible: boolean;
    type: 'vector' | 'raster' | 'height';
}

const registerProjections = () => {
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs("EPSG:2176", "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +no_defs');
    register(proj4);
}

const MapComponent = () => {
    const [map, setMap] = useState<Map | null>(null);
    const mapElement = useRef<HTMLDivElement | null>(null);
    const [layers, setLayers] = useState<LayerInfo[]>([]);
    const layersRef = useRef<LayerInfo[]>([]);
    const layersLoadedRef = useRef(false);

    const toggleLayerVisibility = useCallback((layerId: string) => {
        const layerInfo = layersRef.current.find(l => l.id === layerId);
        if (layerInfo) {
            const newVisibility = !layerInfo.visible;
            layerInfo.layer.setVisible(newVisibility);
            layerInfo.visible = newVisibility;

            setLayers(prev => prev.map(layer => 
                layer.id === layerId 
                    ? { ...layer, visible: newVisibility }
                    : layer
            ));
        }
    }, []);

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
    
    const createVectorLayer = async (config: typeof VECTOR_LAYERS_CONFIG[0]) => {
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

    useEffect(() => {
        if (!mapElement.current) return;

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                projection: 'EPSG:3857',
                center: [2000000, 6000000],
                zoom: 4,
            }),
        });

        setMap(initialMap);

        return () => {
            initialMap.setTarget(undefined);
        };
    }, []);

    useEffect(() => {
        if (layersLoadedRef.current || !map) return;
        layersLoadedRef.current = true;

        registerProjections();

        const loadLayers = async () => {
            try {
                const loadedLayers = await Promise.all(
                    VECTOR_LAYERS_CONFIG.map(async (config) => {
                        const vectorLayer = await createVectorLayer(config);
                        map.addLayer(vectorLayer);
                        return {
                            id: config.id,
                            name: config.name,
                            layer: vectorLayer,
                            visible: true,
                            type: 'vector' as const
                        };
                    })
                );

                layersRef.current = loadedLayers;
                setLayers(loadedLayers);

                const extent = loadedLayers.reduce((acc, layerInfo) => {
                    const source = layerInfo.layer.getSource() as VectorSource;
                    const layerExtent = source.getExtent();
                    if (!acc) return layerExtent;
                    if (!layerExtent) return acc;
                    return [
                        Math.min(acc[0], layerExtent[0]),
                        Math.min(acc[1], layerExtent[1]),
                        Math.max(acc[2], layerExtent[2]),
                        Math.max(acc[3], layerExtent[3])
                    ];
                }, undefined as number[] | undefined);

                if (extent) {
                    map.getView().fit(extent, {
                        padding: [50, 50, 50, 50],
                        maxZoom: 18
                    });
                }
            } catch (error) {
                console.error('Error loading layers:', error);
            }
        };

        loadLayers();
    }, [map]);

    return (
        <div>
            <LayerManager 
                layers={layers}
                onToggleLayer={toggleLayerVisibility}
            />
            <div 
                ref={mapElement} 
                style={{ width: '100%', height: '100vh' }}
            />
        </div>
    );
};

export default MapComponent;