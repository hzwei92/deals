import { IonContent, IonPage } from '@ionic/react';

import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useRef, useState } from 'react';
 
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;
const MapComponent: React.FC = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);


  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      trackResize: true,
    });
    map.current.on('load', function () {
      map.current?.resize();
      setIsMapLoaded(true);
    });
  });

  return (
    <IonPage>
      <IonContent fullscreen style={{
        position: 'relative',
      }}>
        <div ref={mapContainer} className="map-container" style={{
          opacity: isMapLoaded ? 1 : 0,
          height: '100%',
        }} />
      </IonContent>
    </IonPage>
  );
};

export default MapComponent;
