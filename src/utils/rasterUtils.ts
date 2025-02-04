import Lerc from 'lerc';
import { XYZ } from 'ol/source';

interface RasterMetadata {
    maxVal: number;
    minVal: number;
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
    resolutions: number[];
    tileSize: number;
}

export const loadRasterMetadata = async (url: string): Promise<RasterMetadata> => {
    const response = await fetch(url);
    return response.json();
};

export const decodeLercTile = async (arrayBuffer: ArrayBuffer) => {
    try {
        const decodedData = await Lerc.decode(arrayBuffer);
        return decodedData;
    } catch (error) {
        console.error('Error decoding LERC:', error);
        throw error;
    }
};

export const createWebGLTileLayer = (baseUrl: string, metadata: RasterMetadata, isHeight: boolean) => {
    return {
        source: new XYZ({
            url: `${baseUrl}/{z}/{x}/{y}.lerc`,
            tileLoadFunction: async (tile: any, url: string) => {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const decoded = await decodeLercTile(arrayBuffer);
                
                tile.setData(decoded.pixels[0]);
            },
            maxZoom: metadata.resolutions.length - 1,
        }),
        style: {
            variables: {
                min: metadata.minVal,
                max: metadata.maxVal,
            },
            color: isHeight ? 
                ['interpolate', ['linear'], ['band', 1], metadata.minVal, '#000', metadata.maxVal, '#fff'] :
                ['rgb', ['band', 1], ['band', 2], ['band', 3]],
        },
    };
};

export const loadRasterLayer = async (config: { id: string, name: string, type: string, url: string, metadataUrl: string }) => {
    const metadata = await loadRasterMetadata(config.metadataUrl);
    const isHeight = config.type === 'height';
    return createWebGLTileLayer(config.url, metadata, isHeight);
};
