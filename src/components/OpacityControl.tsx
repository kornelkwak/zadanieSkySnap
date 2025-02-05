import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ControlContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const Label = styled.label`
    text-align: left;
    flex: 1;
    margin-right: 10px;
`;

const Slider = styled.input`
    flex: 2;
    cursor: pointer;
    background-color: #00B0EF;
    
    &::-webkit-slider-thumb {
        background-color: #00B0EF;
        cursor: pointer;
    }
`;

const Value = styled.span`
    width: 40px;
    text-align: right;
`;

interface OpacityControlProps {
    layerId: string;
    layerName: string;
    initialOpacity: number;
    onOpacityChange: (layerId: string, newOpacity: number) => void;
}

const OpacityControl: React.FC<OpacityControlProps> = ({ layerId, layerName, initialOpacity, onOpacityChange }) => {
    const [opacity, setOpacity] = useState(initialOpacity);

    useEffect(() => {
        setOpacity(initialOpacity);
    }, [initialOpacity]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newOpacity = parseFloat(event.target.value);
        setOpacity(newOpacity);
        onOpacityChange(layerId, newOpacity);
    };

    return (
        <ControlContainer>
            <Label htmlFor={`opacity-${layerId}`}>{layerName}:</Label>
            <Slider
                type="range"
                id={`opacity-${layerId}`}
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={handleChange}
            />
            <Value>{(opacity * 100).toFixed(0)}%</Value>
        </ControlContainer>
    );
};

export default OpacityControl;