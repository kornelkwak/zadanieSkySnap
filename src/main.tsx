import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./global.css";
import Layout from './components/Layout';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from './view/MainPage';
import MapView from './view/MapView';
import PointCloudView from './view/PointCloudView';

/**
 * Define the routes for the application.
 */
const router = createBrowserRouter([
  {
      path: "",
      element: <Layout />,
      children: [
          {
              path: "/",
              element: <MainPage />
          },
          {
              path: "/mapa",
              element: <MapView />
          },
          {
              path: "/3d",
              element: <PointCloudView/>,
          },
      ],
  },
  {
      path: "test",
      element: <Layout />,
  },
]);

/**
 * Render the application.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
