import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./global.css";
import Layout from './components/Layout';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from './view/MainPage';
import MapView from './view/MapView';
import PointCloudView from './view/PointCloudView';


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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
