import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { toStringHDMS } from 'ol/coordinate';
import { transform } from 'ol/proj';

interface CoordinateDisplayProps {
    map: Map | null;
}

const Footer = styled.footer`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: white;
    padding: 10px;
    text-align: center;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 1000;
    gap: 20px;
`;

const CoordinateDisplayStyled = styled.div`
    text-align: right;
`;

const CoordinateSystemSelector = styled.select`
    background-color: #444;
    color: white;
    border: none;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
`;

const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({ map }) => {
    const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
    const [coordinateSystem, setCoordinateSystem] = useState<'EPSG:4326' | 'EPSG:3857' | 'EPSG:2176' | 'HDMS'>('EPSG:3857');

    const handleMouseMove = useCallback((event: any) => {
        if (!map) return;

        const pixel = map.getEventPixel(event.originalEvent);
        const mapCoordinate = map.getCoordinateFromPixel(pixel);

        if (mapCoordinate) {
            setCoordinate(mapCoordinate);
        } else {
            setCoordinate(null);
        }
    }, [map]);

    useEffect(() => {
        if (!map) return;

        map.on('pointermove', handleMouseMove);

        return () => {
            map.un('pointermove', handleMouseMove);
        };
    }, [map, handleMouseMove]);

    const formatCoordinate = (coord: Coordinate | null) => {
        if (!coord) return 'Najedź kursorem na mapę';

        switch (coordinateSystem) {
            case 'EPSG:4326':
                const transformed4326 = transform(coord, 'EPSG:3857', 'EPSG:4326');
                return `${transformed4326[1].toFixed(6)}, ${transformed4326[0].toFixed(6)}`;
            case 'EPSG:3857':
                return `${coord[1].toFixed(2)}, ${coord[0].toFixed(2)}`;
            case 'EPSG:2176':
                const transformed2176 = transform(coord, 'EPSG:3857', 'EPSG:2176');
                return `${transformed2176[0].toFixed(2)}, ${transformed2176[1].toFixed(2)}`;
            case 'HDMS':
                const transformedHDMS = transform(coord, 'EPSG:3857', 'EPSG:4326');
                return toStringHDMS(transformedHDMS);
            default:
                return 'Nieznany układ współrzędnych';
        }
    };

    return (
        <Footer>
            <CoordinateDisplayStyled>
                {formatCoordinate(coordinate)}
            </CoordinateDisplayStyled>
            <CoordinateSystemSelector
                value={coordinateSystem}
                onChange={(e) => setCoordinateSystem(e.target.value as 'EPSG:4326' | 'EPSG:3857' | 'EPSG:2176' | 'HDMS')}
            >
                <option value="EPSG:3857">EPSG:3857</option>
                <option value="EPSG:2176">EPSG:2176</option>
                <option value="EPSG:4326">EPSG:4326</option>
                <option value="HDMS">HDMS</option>
            </CoordinateSystemSelector>
        </Footer>
    );
};

export default CoordinateDisplay;
