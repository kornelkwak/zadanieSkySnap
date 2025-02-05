import { useEffect, useState, useRef, useCallback } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { Feature, Map, View } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Geometry } from "ol/geom";
import VECTOR_LAYERS_CONFIG from "../constants/vectorLayersConfig";
import RASTER_LAYERS_CONFIG from '../constants/layersConfig';
import LayerManager from './LayerManager';
import DataTileSource from "ol/source/DataTile";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { createRasterLayer } from '../utils/rasterUtils';
import { createVectorLayer } from "../utils/vectorUtils";
import OpacityControl from './OpacityControl';
import CoordinateDisplay from './CoordinateDisplay';

interface LayerInfo {
    id: string;
    name: string;
    layer: TileLayer<DataTileSource> | VectorLayer<VectorSource<Feature<Geometry>>> | TileLayer<XYZ> | WebGLTileLayer;
    visible: boolean;
    type: 'vector' | 'raster' | 'height';
    opacity?: number;
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
    const [isOpacityPanelOpen, setIsOpacityPanelOpen] = useState(false);

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

    const handleOpacityChange = useCallback((layerId: string, newOpacity: number) => {
        const layerInfo = layersRef.current.find(l => l.id === layerId);
        if (layerInfo) {
            layerInfo.layer.setOpacity(newOpacity);
            layerInfo.opacity = newOpacity;

            setLayers(prev => prev.map(layer =>
                layer.id === layerId
                    ? { ...layer, opacity: newOpacity }
                    : layer
            ));
        }
    }, []);

    useEffect(() => {
        if (!mapElement.current) return;

        registerProjections();

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                })
            ],
            view: new View({
                projection: 'EPSG:3857',
                center: [5575812.814, 5996057.464000234],
                zoom: 2,
                constrainResolution: true
            }),
        });

        setMap(initialMap);

        return () => initialMap.setTarget('');
    }, []);

    useEffect(() => {
        if (layersLoadedRef.current || !map) return;
        layersLoadedRef.current = true;

        registerProjections();

        const loadAllLayers = async () => {
            try {

                const rasterLayers = await Promise.all(
                    RASTER_LAYERS_CONFIG.map(async (config) => {
                        const layer = await createRasterLayer(config);
                        map.addLayer(layer);
                        return {
                            id: config.id,
                            name: config.name,
                            layer,
                            visible: true,
                            type: config.type,
                        };
                    })
                );

                const vectorLayers = await Promise.all(
                    VECTOR_LAYERS_CONFIG.map(async (config) => {
                        const layer = await createVectorLayer(config);
                        map.addLayer(layer);
                        return {
                            id: config.id,
                            name: config.name,
                            layer,
                            visible: true,
                            type: 'vector' as const,
                        };
                    })
                );

                const allLayers = [...rasterLayers, ...vectorLayers];
                layersRef.current = allLayers;
                setLayers(allLayers);

                const vectorExtent = vectorLayers.reduce((acc, layerInfo) => {
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

                if (vectorExtent) {
                    map.getView().fit(vectorExtent, {
                        padding: [50, 50, 50, 50],
                    });
                }
            } catch (error) {
                console.error('Error loading layers:', error);
            }
        };

        loadAllLayers();
    }, [map]);

    return (
        <div>
            <LayerManager 
                layers={layers}
                onToggleLayer={toggleLayerVisibility}
            />
            <button style={{
                position: 'absolute',
                bottom: '70px',
                right: '30px',
                width: '50px',
                height: '50px',
                fontSize: '20px',
                textAlign: 'center',
                borderRadius: '50%',
                backgroundColor: '#00B0EF',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1001,
            }} onClick={() => setIsOpacityPanelOpen(!isOpacityPanelOpen)}>
                {isOpacityPanelOpen ? 'x' : 'o'}
            </button>
            {isOpacityPanelOpen && (
                <div style={{
                    position: 'absolute',
                    top: '90px',
                    right: '10px',
                    background: '#404040',
                    color: 'white',
                    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {layers.map(layer => (
                            <OpacityControl
                                key={layer.id}
                                layerId={layer.id}
                                layerName={layer.name}
                                initialOpacity={layer.opacity || 1}
                                onOpacityChange={handleOpacityChange}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div 
                ref={mapElement} 
                style={{ width: '100%', height: '90vh' }}
            />
            <CoordinateDisplay map={map} />
        </div>
    );
};

export default MapComponent;