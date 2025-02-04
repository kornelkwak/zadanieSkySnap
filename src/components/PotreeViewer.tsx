import { useEffect, useRef } from "react";
import "../utils/potree/build/potree/potree.css"
import "../utils/potree/libs/jquery-ui/jquery-ui.min.css";
import "../utils/potree/libs/openlayers3/ol.css";
import "../utils/potree/libs/spectrum/spectrum.css";
import "../utils/potree/libs/jstree/themes/mixed/style.css";
import POINT_CLOUD_CONFIG from "../constants/pointCloudConfig";

const PotreeViewer = () => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPotree = async () => {
      if (!window.Potree) {
        const scripts = [
          "src/utils/potree/libs/jquery/jquery-3.1.1.js",
          "src/utils/potree/libs/spectrum/spectrum.js",
          "src/utils/potree/libs/jquery-ui/jquery-ui.min.js",
          "src/utils/potree/libs/other/BinaryHeap.js",
          "src/utils/potree/libs/tween/tween.min.js",
          "src/utils/potree/libs/d3/d3.js",
          "src/utils/potree/libs/proj4/proj4.js",
          "src/utils/potree/libs/openlayers3/ol.js",
          "src/utils/potree/libs/i18next/i18next.js",
          "src/utils/potree/libs/jstree/jstree.js",
          "src/utils/potree/libs/copc/index.js",
          "src/utils/potree/build/potree/potree.js",
          "src/utils/potree/libs/plasio/js/laslaz.js",
        ];

        for (const src of scripts) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
          });
        }
      }

      if (window.Potree && viewerRef.current) {
        const viewer = new window.Potree.Viewer(viewerRef.current);
        viewer.setEDLEnabled(true);
        viewer.setFOV(60);
        viewer.setPointBudget(2_000_000);
        viewer.loadSettingsFromURL();

        const path = POINT_CLOUD_CONFIG.path;
        const name = POINT_CLOUD_CONFIG.name;

        window.Potree.loadPointCloud(path, name, (e: any) => {
          viewer.scene.addPointCloud(e.pointcloud);
          let material = e.pointcloud.material;
          material.size = 1;
          material.pointSizeType = window.Potree.PointSizeType.ADAPTIVE;
          viewer.fitToScreen(0.5);
        });
      }
    };

    loadPotree();
  }, []);

  return <div id="potree_render_area" ref={viewerRef} />;

};

export default PotreeViewer;
