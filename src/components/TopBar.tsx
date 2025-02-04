import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const TopBarContainer = styled.div`
    display: flex;
    position: sticky;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #363636;
    color: white;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 500;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;
    z-index: 10;
`;

const Title = styled.h1`
    font-size: 2rem;
`;

const Logo = styled.img`
    width: 50px;
    height: 50px;
    cursor: pointer;
`;

const NavLinks = styled.div`
    ul {
        list-style-type: none;
        padding: 0;
        display: flex;
        gap: 10px;
        font-weight: 600;
    }
`;

const StyledNavLink = styled(NavLink)`
    text-decoration: none;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    transition: background-color 0.3s;

    &.active {
        background-color: #00B0EF;
    }

    &:hover {
        color: #363636!important;
        background-color: #00B0EF;
    }

    &:visited {
        color: white;
    }
    `;

const TopBar: React.FC = () => {

    return (
        <TopBarContainer>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <NavLink to="/">
                    <Logo src="logo-skysnap-sq.webp" />
                </NavLink>
                <Title style={{ marginLeft: '10px' }}>SkySnap - Rekrutacja 2025</Title>
            </div>
            <NavLinks>
                <ul>
                    <li>
                        <StyledNavLink to="/">
                            Home
                        </StyledNavLink>
                    </li>
                    <li>
                        <StyledNavLink to="/mapa">
                            Mapa
                        </StyledNavLink>
                    </li>
                    <li>
                        <StyledNavLink to="/3d">
                            Widok 3D
                        </StyledNavLink>
                    </li>
                </ul>
            </NavLinks>
        </TopBarContainer>
    );
};

export default TopBar;