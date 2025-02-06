import { useEffect, useState, useRef, useCallback } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import styled from 'styled-components';
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
import CoordinateDisplay from './CoordinateDisplay';
import OpacityPanel from './OpacityPanel';

/**
 * Interface representing layer information.
 */
interface LayerInfo {
    id: string;
    name: string;
    layer: TileLayer<DataTileSource> | VectorLayer<VectorSource<Feature<Geometry>>> | TileLayer<XYZ> | WebGLTileLayer;
    visible: boolean;
    type: 'vector' | 'raster' | 'height';
    opacity?: number;
}

/**
 * Registers custom projections.
 */
const registerProjections = () => {
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs("EPSG:2176", "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +no_defs');
    register(proj4);
}

const OpacityButton = styled.button`
    position: absolute;
    bottom: 70px;
    right: 30px;
    width: 50px;
    height: 50px;
    font-size: 20px;
    text-align: center;
    border-radius: 50%;
    background-color: #00B0EF;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1001;
`;

const MapDiv = styled.div`
    width: 100%;
    height: 90vh;
`;

/**
 * MapComponent functional component.
 * @returns {JSX.Element} - The rendered component.
 */
const MapComponent = () => {
    const [map, setMap] = useState<Map | null>(null);
    const mapElement = useRef<HTMLDivElement | null>(null);
    const [layers, setLayers] = useState<LayerInfo[]>([]);
    const layersRef = useRef<LayerInfo[]>([]);
    const layersLoadedRef = useRef(false);
    const [isOpacityPanelOpen, setIsOpacityPanelOpen] = useState(false);

    /**
     * Toggles the visibility of a layer.
     * @param {string} layerId - The ID of the layer to toggle.
     */
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

    /**
     * Handles the opacity change of a layer.
     * @param {string} layerId - The ID of the layer to change opacity.
     * @param {number} newOpacity - The new opacity value.
     */
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
            <OpacityButton title="Zmień widoczność warstw" onClick={() => setIsOpacityPanelOpen(!isOpacityPanelOpen)}>
                {isOpacityPanelOpen ? 'x' : 'o'}
            </OpacityButton>
            {isOpacityPanelOpen && (
                <OpacityPanel
                    layers={layers}
                    onOpacityChange={handleOpacityChange}
                />
            )}
            <MapDiv ref={mapElement} />
            <CoordinateDisplay map={map} />
        </div>
    );
};

export default MapComponent;