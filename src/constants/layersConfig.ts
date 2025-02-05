const RASTER_LAYERS_CONFIG = [
    {
        id: 'height-raster',
        name: 'Raster Wysokościowy',
        type: 'height' as const,
        url: '/data/6/rasters/499/499',
        metadataUrl: '/data/6/rasters/499/499/metadata.json',
        tileUrlTemplate: '/data/6/rasters/499/499/{z}/{y}/{x}.lerc',
        zIndex: 1,
        projection: 'EPSG:2176'
    }
];

export default RASTER_LAYERS_CONFIG;