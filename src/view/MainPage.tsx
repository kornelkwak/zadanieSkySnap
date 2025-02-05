import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 20px;
    background-color: #404040;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 500;
`;

const Card = styled(NavLink)`
    width: 200px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #00B0EF;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;
    cursor: pointer;
    transition: transform 0.3s;
    text-decoration: none;
    color: white;
    padding: 20px;
    text-align: center;

    &:hover {
        color: #363636!important;
        transform: scale(1.05);
    }

    &:visited {
        color: white;
    }
`;

const MainPage: React.FC = () => {
    return (
        <Container>
            <Card to="/mapa">
                <h2>Mapa 2D</h2>
            </Card>
            <Card to="/3d">
                <h2>Chmura Punktów 3D</h2>
            </Card>
        </Container>
    );
};

export default MainPage;