import React from 'react';
import styled from 'styled-components';
import OpacityControl from './OpacityControl';

/**
 * Props for the OpacityPanel component.
 */
interface OpacityPanelProps {
    layers: any[];
    onOpacityChange: (layerId: string, newOpacity: number) => void;
}

const Panel = styled.div`
    position: absolute;
    top: 90px;
    right: 10px;
    background-color: #404040;
    color: white;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.h3`
    text-align: center;
    padding: 5px 0;
`;

/**
 * OpacityPanel component for adjusting the opacity of multiple layers.
 * @param {OpacityPanelProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
const OpacityPanel: React.FC<OpacityPanelProps> = ({ layers, onOpacityChange }) => {
    return (
        <Panel>
            <Title>Widoczność warstw</Title>
            <List>
                {layers.map(layer => (
                    <OpacityControl
                        key={layer.id}
                        layerId={layer.id}
                        layerName={layer.name}
                        initialOpacity={layer.opacity || 1}
                        onOpacityChange={onOpacityChange}
                    />
                ))}
            </List>
        </Panel>
    );
};

export default OpacityPanel;