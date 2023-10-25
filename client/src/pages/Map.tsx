import { IonCard, IonContent, IonPage, isPlatform, useIonRouter } from '@ionic/react';
import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useContext, useEffect, useRef, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { selectChannels } from '../slices/channelSlice';
import { selectAppUser, selectUsers } from '../slices/userSlice';
import { useAppSelector } from '../store';
import { AppContext } from '../App';
import useGetChannels from '../hooks/useGetChannels';
import useGetMemberships from '../hooks/useGetMemberships';
import ChannelPopup from '../components/ChannelPopup';
import NewChannelPopup from '../components/NewChannelPopup';
import { selectMembershipsByChannelId, selectMembershipsByUserId } from '../slices/membershipSlice';
import useGetChannelMemberships from '../hooks/useGetChannelMemberships';
import useJoinChannel from '../hooks/useJoinChannel';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;


const MapComponent: React.FC = () => {
  const {
    authModal,
    shouldUpdateMapData,
    setShouldUpdateMapData,
    newChannelLngLat,
    setNewChannelLngLat,
    channelId,
    setChannelId,
  } = useContext(AppContext);

  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);

  const [mapLng, setMapLng] = useState(-70.9);
  const [mapLat, setMapLat] = useState(42.35);
  const [mapZoom, setMapZoom] = useState(9);

  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const creationPopupRoot = useRef<Root | null>(null);

  const users = useAppSelector(selectUsers);
  const channels = useAppSelector(selectChannels);

  const memberships = useAppSelector(state => selectMembershipsByUserId(state, user?.id ?? -1));

  const [channelPopup, setChannelPopup] = useState<mapboxgl.Popup | null>(null);
  const [channelPopupRoot, setChannelPopupRoot] = useState<Root | null>(null);

  const channelMemberships = useAppSelector(state => selectMembershipsByChannelId(state, channelId ?? -1));

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const joinChannel = useJoinChannel();
  
  const getChannelMemberships = useGetChannelMemberships();
  const getMemberships = useGetMemberships(setShouldUpdateMapData);

  const getChannels = useGetChannels(setShouldUpdateMapData);

  const createChannel = () => {
    if (user?.id) {
      router.push('/create-channel');
    }
    else {
      authModal?.current?.present();
    }
  };

  const enterChannel = (id: number) => (mode: string) => () => {
    router.push('/channel/' + id + '/' + mode);
    if (!memberships.some(membership => membership.channelId === id)) {
      joinChannel(id);
    }
  }
  // fetch channels
  useEffect(() => {
    getChannels(mapLng, mapLat);
    map.current?.resize();
  }, []);

  // fetch memberships
  useEffect(() => {
    if (user?.id) {
      getMemberships();
    }
  }, [user?.id])

  // initialize map
  useEffect(() => {
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
    console.log('map initialized', user);
    map.current.on('click', (e) => {
      setTimeout(() => {
        if (e.clickOnLayer) {
          return;
        }
        console.log('map click', e.lngLat);

        setNewChannelLngLat(e.lngLat);
        setChannelId(null);
      }, 100)
    });
  }, [user?.id]);

  // update map data
  useEffect(() => {
    if (!map.current || !isMapLoaded || !shouldUpdateMapData) return;

    // load channel data as map source 

    if (map.current.getSource('channels')) {
      // remove existing layers and sources
      map.current.removeLayer('clusters');
      map.current.removeLayer('cluster-count');
      map.current.removeLayer('unclustered-point');
      map.current.removeSource('channels');
    }

    map.current.addSource('channels', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: Object.values(channels).map(channel => ({
          type: 'Feature',
          properties: {
            id: channel.id,
            memberCount: channel.memberCount,
            activeUserCount: channel.activeUserCount,
          },
          geometry: {
            type: 'Point',
            coordinates: [channel.lng, channel.lat],
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 30,
      clusterProperties: {
        memberCount: ['+', ['get', 'memberCount']],
        activeUserCount: ['+', ['get', 'activeUserCount']],
      },
    });
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'channels',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'case',
          ['>', ['get', 'activeUserCount'], 0],
          '#f4900c',
          'grey',
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
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'channels',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
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
        'circle-color':  [
          'case',
          ['>', ['get', 'activeUserCount'], 0],
          '#f4900c',
          'grey',
        ],
        'circle-radius': 10,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff' 
      } 
    });  

    map.current.on('click', 'clusters', (e) => {
      e.clickOnLayer = true;

      setChannelId(null);

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

      if (!e.features) return;
      const id = e.features[0].properties?.id;

      setChannelId(prev => {
        return prev === id ? null : id;
      });
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

    setShouldUpdateMapData(false);
  }, [
    isMapLoaded, 
    shouldUpdateMapData, 
    channels, 
    memberships,
    map.current?.getSource('channels'), 
    channelId, 
    !!channelPopup, 
    !!channelPopupRoot,
    channelMemberships,
    users,
  ])

  // update channel popup
  useEffect(() => {
    // update channel popup
    if (channelId) {
      setNewChannelLngLat(null);

      if (channelPopup && channelPopupRoot) {
        channelPopupRoot.render(<ChannelPopup 
          userId={user?.id ?? -1}
          channel={channels[channelId]} 
          enterChannel={enterChannel(channelId)} 
          channelMemberships={channelMemberships}
          users={users} 
        />);

        channelPopup
          .setLngLat([channels[channelId].lng, channels[channelId].lat])
          .addTo(map.current!);
      }
      else {
        const channelPopupNode = document.createElement('div');
        const root = createRoot(channelPopupNode);
        root.render(<ChannelPopup 
          userId={user?.id ?? - 1}
          channel={channels[channelId]} 
          enterChannel={enterChannel(channelId)} 
          channelMemberships={channelMemberships}
          users={users} />);

        const popup = new mapboxgl.Popup({
          offset: 15,
          focusAfterOpen: true,
          closeButton: false,
        })
        .setLngLat([channels[channelId].lng, channels[channelId].lat])
        .setDOMContent(channelPopupNode)
        .addTo(map.current!);       

        setChannelPopup(popup);
        setChannelPopupRoot(root);
      }
    }
    else {
      channelPopup?.remove();
      setChannelPopup(null);
    }
  }, [channelId, channels, memberships, users]);

  // update new channel marker/popup
  useEffect(() => {
    if (newChannelLngLat) {

      setChannelId(null);

      if (marker.current && creationPopupRoot.current) {
        creationPopupRoot.current.render(<NewChannelPopup createChannel={createChannel}/>);
        marker.current
          .setLngLat(newChannelLngLat)
          .addTo(map.current!)

        if (!marker.current.getPopup().isOpen()) {
          marker.current.togglePopup();
        }
      }
      else {
        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);
        root.render(<NewChannelPopup createChannel={createChannel}/>);

        creationPopupRoot.current = root;

        marker.current = new mapboxgl.Marker({
          color: '#f4900c',
        })
        .setLngLat(newChannelLngLat)
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
          setNewChannelLngLat(null);
          marker.current?.remove();
        });
      }
    }
    else {
      marker.current?.remove();
    }
  }, [newChannelLngLat]);

  useEffect(() => {
    if (channelId) {
      getChannelMemberships(channelId);
    }
  }, [channelId])

  return (
    <IonPage>
      <IonContent fullscreen style={{
        position: 'relative',
      }}>
        <div ref={mapContainer} className="map-container" style={{
          opacity: isMapLoaded ? 1 : 0,
          top: 0,
          height: '100%',
        }} />
        <IonCard style={{
          position: 'fixed',
          borderRadius: 3,
          zIndex: 10,
          left: isPlatform('ios') ? -10 : 0,
          top: isPlatform('ios') ? 32 : 52,
          padding: 10,
        }}>
          {
            channelId
              ? channels[channelId].lng.toPrecision(6) + ', ' + channels[channelId].lat.toPrecision(6)
              : newChannelLngLat
                ? newChannelLngLat?.lng.toPrecision(6) + ', ' + newChannelLngLat?.lat.toPrecision(6)
                : mapLng.toPrecision(6) + ', ' + mapLat.toPrecision(6) 
          }
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default MapComponent;
