import { gql, useMutation } from '@apollo/client';
import { IonButton, IonButtons, IonContent, IonPage, useIonRouter } from '@ionic/react';
import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { activateChannel, addChannels, selectChannels } from '../slices/channelSlice';
import { selectAppUser } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel } from '../types/Channel';

const GET_CHANNELS = gql`
  mutation GetChannels($lng: Float!, $lat: Float!) {
    getChannels(lng: $lng, lat: $lat) {
      id
      name
      detail
      ownerId
      lat
      lng
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

const CREATE_CHANNEL = gql`
  mutation CreateChannel($lng: Float!, $lat: Float!) {
    createChannel(lng: $lng, lat: $lat) {
      id
      name
      detail
      ownerId
      lat
      lng
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;


interface ChannelPopupProps {
  channel: Channel;
  joinChannel: () => void;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ channel, joinChannel }) => {
  return (
    <div className="popup" style={{
      marginTop: 5
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        { channel.name }
      </div>
      <IonButtons style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <IonButton onClick={joinChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          JOIN CHANNEL
        </IonButton>
      </IonButtons>
    </div>
  )
}


interface PopupProps {
  createChannel: () => void;
}
const Popup: React.FC<PopupProps> = ({ createChannel }) => {
  return (
    <div className="popup" style={{
      marginTop: 5
    }}>
      <IonButtons style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <IonButton onClick={createChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          CREATE CHANNEL
        </IonButton>
      </IonButtons>
    </div>
  )
}

const MapComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);

  const [createChannel] = useMutation(CREATE_CHANNEL, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addChannels([data.createChannel]));
      dispatch(activateChannel(data.createChannel.id));
      router.push('/map/channel/' + data.createChannel.id);
    },
  });

  const create = () => {
    createChannel({
      variables: {
        lng: marker.current?.getLngLat().lng,
        lat: marker.current?.getLngLat().lat,
      },
    });
  }

  const [mapLng, setMapLng] = useState(-70.9);
  const [mapLat, setMapLat] = useState(42.35);
  const [mapZoom, setMapZoom] = useState(9);

  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const channels = useAppSelector(selectChannels);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [shouldAddSource, setShouldAddSource] = useState(false);

  const joinChannel = (id: number) => () => {
    router.push('/map/channel/' + id);
    dispatch(activateChannel(id));
  }

  useEffect(() => {
    console.log('adding source', map.current?.loaded(), shouldAddSource, map.current?.getSource('channels'));

    if (!map.current || !isMapLoaded || !shouldAddSource || map.current.getSource('channels')) return;
    map.current.addSource('channels', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: Object.values(channels).map(channel => ({
          type: 'Feature',
          properties: {
            id: channel.id,
          },
          geometry: {
            type: 'Point',
            coordinates: [channel.lng, channel.lat],
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'channels',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#f4900c',
          10,
          '#f4900c',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          100,
          40,
          1000,
          50,
        ],
      }
    });
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'channels',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count'],
        'text-font': ['Open Sans Semibold'],
        'text-size': 12,
      },
    });

    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'channels',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#f4900c',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    map.current.on('click', 'clusters', (e) => {
      e.clickOnLayer = true;
      marker.current?.remove();
      const features = map.current?.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      if (!features) return;
      const clusterId = features[0].properties?.cluster_id;
      (map.current?.getSource('channels') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          
          map.current?.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    });

    map.current.on('click', 'unclustered-point', (e) => {
      e.clickOnLayer = true;
      marker.current?.remove();
      if (!e.features) return;
      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const id = e.features[0].properties?.id;
       
      // Ensure that if the map is zoomed out such that
      // multiple copies of the feature are visible, the
      // popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
       
      const channelPopupNode = document.createElement('div');
      const root = createRoot(channelPopupNode);
      root.render(<ChannelPopup channel={channels[id]} joinChannel={joinChannel(id)} />);

      new mapboxgl.Popup({
        offset: 15,
        focusAfterOpen: true,
        closeButton: false,
      })
      .setLngLat(coordinates)
      .setDOMContent(channelPopupNode)
      .addTo(map.current!);
    });

    map.current.on('mouseenter', 'clusters', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'clusters', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('mouseenter', 'unclustered-point', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
    });

    setShouldAddSource(false);
  }, [isMapLoaded, shouldAddSource, channels, map.current?.getSource('channels')])

  const [getChannels] = useMutation(GET_CHANNELS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      setShouldAddSource(true);
      dispatch(addChannels(data.getChannels));
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    getChannels({
      variables: {
        lng: mapLng,
        lat: mapLat,
      },
    });
  }, [user?.id]);

  useEffect(() => {
    if (marker.current?.getPopup().isOpen()) return;
    marker.current?.togglePopup();
  }, [marker.current?.getPopup().isOpen()]);

  
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapLng, mapLat],
      zoom: mapZoom,
      trackResize: true,
    });
    map.current.on('load', function () {
      console.log('map loaded');
      map.current?.resize();
      setIsMapLoaded(true);
    });    
    map.current.on('move', () => {
      if (map.current) {
        setMapLng(map.current.getCenter().lng);
        setMapLat(map.current.getCenter().lat);
        setMapZoom(map.current.getZoom());
      }
    });
    map.current.on('click', (e) => {
      setTimeout(() => {
        console.log('click on map')
        if (e.clickOnLayer) return;
  
        if (marker.current) {
          marker.current.setLngLat(e.lngLat)
          .addTo(map.current!)
  
          if (!marker.current.getPopup().isOpen()) {
            marker.current.togglePopup();
          }
        }
        else {
          const popupNode = document.createElement('div');
          const root = createRoot(popupNode);
          root.render(<Popup createChannel={create} />);
  
          marker.current = new mapboxgl.Marker({
            color: '#f4900c',
          })
          .setLngLat(e.lngLat)
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 40,
              focusAfterOpen: true,
              closeButton: false,
            }) // add popups
            .setDOMContent(popupNode)
          )
          .addTo(map.current!)
          .togglePopup();
  
          marker.current.getElement().addEventListener('click', (e) => {
            e.stopPropagation();
            marker.current?.remove();
          });
        }
      }, 100)
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
