import React from 'react';
import HomePage from './app/page'; // správná relativní cesta
import './App.css';
import MainMenu from "./app/page";
import UserPage from './app/profile/page';
import BoxPage from './app/BoxPage/page';
import ContainerPage from './app/ContainerPage/page';
import ShipmentPage from './app/ShipmentPage/page';
import {Route, Routes} from "react-router-dom";
import LoginPage from './app/LoginPage/page';
import RegisterPage from "./app/RegisterPage/page";
import CreateShipment from "./app/CreateShipment/page";
import ShipmentDetail from "./app/ShipmentDetail/page";
import ProfilePage from "./app/profile/page";
import AdminPage from "./app/AdminPage/page";

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/boxes" element={<BoxPage />} />
            <Route path="/containers" element={<ContainerPage />} />
            <Route path="/shipments" element={<ShipmentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-shipment" element={<CreateShipment />} />
            <Route path="/shipments/:id" element={<ShipmentDetail />} />
            // V App.tsx přidat novou route:
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />

        </Routes>
    );
}

export default App;
