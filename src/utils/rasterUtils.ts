import { TileGrid } from "ol/tilegrid";
import DataTileSource from "ol/source/DataTile";
import TileLayer from "ol/layer/Tile";
import lerc from "lerc";
import { transformExtent } from "ol/proj";

/**
 * Interface representing raster metadata.
 */
interface RasterMetadata {
    minVal: number;
    maxVal: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    resolutions: number[];
    tileSize: number;
}

/**
 * Loads raster metadata from a given URL.
 * @param {string} metadataUrl - The URL to fetch metadata from.
 * @returns {Promise<RasterMetadata>} - A promise that resolves to the raster metadata.
 */
export const loadRasterMetadata = async (metadataUrl: string): Promise<RasterMetadata> => {
    const response = await fetch(metadataUrl);
    return await response.json();
};

/**
 * Loads and decodes a LERC tile.
 * @param {Object} z - The zoom level.
 * @param {Object} y - The tile row.
 * @param {Object} x - The tile column.
 * @param {string} tileUrlTemplate - The URL template for the tile.
 * @param {RasterMetadata} metadata - The raster metadata.
 * @returns {Promise<ImageBitmap>} - A promise that resolves to an ImageBitmap.
 */
const lercLoader = async (z: { toString: () => string; }, y: { toString: () => string; }, x: { toString: () => string; }, tileUrlTemplate: string, metadata: RasterMetadata) => {
           
    const url = tileUrlTemplate
        .replace('{z}', z.toString())
        .replace('{y}', y.toString())
        .replace('{x}', x.toString());
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const lercData = lerc.decode(arrayBuffer);

    const width = lercData.width;
    const height = lercData.height;
    const data = new Uint8ClampedArray(width * height * 4);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = y * width + x;
            const destIndex =   y * width + x;
            const value = lercData.pixels[0][srcIndex];

            if (isNaN(value)) {
                data[destIndex * 4 + 3] = 0;
            } else {
                
                const normalized = (value - metadata.minVal) / (metadata.maxVal - metadata.minVal);
                if (normalized < 0.5) {
                    const t = normalized * 2;
                    data[destIndex * 4] = 0;                  // R
                    data[destIndex * 4 + 1] = Math.floor(255 * t);  // G
                    data[destIndex * 4 + 2] = Math.floor(255 * (1 - t)); // B
                } else {
                    const t = (normalized - 0.5) * 2;
                    data[destIndex * 4] = Math.floor(255 * t);     // R
                    data[destIndex * 4 + 1] = Math.floor(255 * (1 - t)); // G
                    data[destIndex * 4 + 2] = 0;                   // B
                }
                data[destIndex * 4 + 3] = 255; // Alpha
            }
        }
    }
    
    const imageData = new ImageData(data, width, height);
    return await createImageBitmap(imageData);
};

/**
 * Creates a raster layer using the provided configuration.
 * @param {Object} config - The configuration object.
 * @param {string} config.metadataUrl - The URL to fetch metadata from.
 * @param {string} config.projection - The projection of the raster layer.
 * @param {string} config.tileUrlTemplate - The URL template for the tiles.
 * @param {number} config.opacity - The opacity of the layer.
 * @param {number} config.zIndex - The z-index of the layer.
 * @returns {Promise<TileLayer>} - A promise that resolves to a TileLayer.
 */
export const createRasterLayer = async (config: any) => {
    const metadata = await loadRasterMetadata(config.metadataUrl);
    
    const extent: [number, number, number, number] = [
        metadata.minX, metadata.minY, metadata.maxX, metadata.maxY
    ];

    const tileGrid = new TileGrid({
        extent,
        origin: [metadata.minX, metadata.maxY],
        resolutions: metadata.resolutions,
        tileSize: metadata.tileSize
    });

    const rasterSource = new DataTileSource({
        projection: config.projection,
        tileGrid,
        loader: (z, y, x) => lercLoader(z, y, x, config.tileUrlTemplate, metadata),
        tileSize: metadata.tileSize
    });

    const extent3857 = transformExtent(extent, config.projection, 'EPSG:3857');

    return new TileLayer({
        source: rasterSource,
        opacity: config.opacity,
        zIndex: config.zIndex,
        extent: extent3857
    });
};
