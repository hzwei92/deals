import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useContext, useEffect, useRef, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { selectChannels } from '../slices/channelSlice';
import { selectAppUser, selectUsers } from '../slices/userSlice';
import { useAppSelector } from '../store';
import { AppContext } from '../App';
import useGetChannels from '../hooks/useGetChannels';
import useCreateChannel from '../hooks/useCreateChannel';
import useGetMemberships from '../hooks/useGetMemberships';
import ChannelPopup from '../components/ChannelPopup';
import CreateChannelPopup from '../components/CreateChannelPopup';
import { selectMembershipsByChannelId, selectMembershipsByUserId } from '../slices/membershipSlice';
import useGetChannelMemberships from '../hooks/useGetChannelMemberships';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;


const MapComponent: React.FC = () => {
  const {
    authModal,
    shouldUpdateMapData,
    setShouldUpdateMapData,
  } = useContext(AppContext);

  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);

  const [mapLng, setMapLng] = useState(-70.9);
  const [mapLat, setMapLat] = useState(42.35);
  const [mapZoom, setMapZoom] = useState(9);

  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const users = useAppSelector(selectUsers);
  const channels = useAppSelector(selectChannels);

  const memberships = useAppSelector(state => selectMembershipsByUserId(state, user?.id ?? -1));

  const [channelId, setChannelId] = useState<number | null>(null);
  const [channelPopup, setChannelPopup] = useState<mapboxgl.Popup | null>(null);
  const [channelPopupRoot, setChannelPopupRoot] = useState<Root | null>(null);

  const [createChannelPopupRoot, setCreateChannelPopupRoot] = useState<Root | null>(null);
  const channelMemberships = useAppSelector(state => selectMembershipsByChannelId(state, channelId ?? -1));

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const joinChannel = (id: number) => () => {
    router.push('/channel/' + id + '/call');
  }  
  
  const getChannelMemberships = useGetChannelMemberships();
  const getMemberships = useGetMemberships(setShouldUpdateMapData);

  const getChannels = useGetChannels(setShouldUpdateMapData);
  const createChannel = useCreateChannel(setShouldUpdateMapData);

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

        channelPopup?.remove();
        setChannelId(null);
        setChannelPopup(null);

        const handleCreate = () => {
          if (user?.id) {
            marker.current?.remove();
            createChannel(e.lngLat.lng, e.lngLat.lat)
          }
          else {
            authModal.current?.present();
          }
        }
        if (marker.current && createChannelPopupRoot) {
          createChannelPopupRoot.render(<CreateChannelPopup createChannel={handleCreate} />);

          marker.current.setLngLat(e.lngLat)
          .addTo(map.current!)
  
          if (!marker.current.getPopup().isOpen()) {
            marker.current.togglePopup();
          }
        }
        else {
          const popupNode = document.createElement('div');
          const root = createRoot(popupNode);
          root.render(<CreateChannelPopup createChannel={handleCreate} />);

          setCreateChannelPopupRoot(root);
  
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
  }, [user?.id]);

  useEffect(() => {
    if (channelId && channelPopup && channelPopupRoot) {
      // update channel popup
      channelPopupRoot.render(<ChannelPopup 
        channel={channels[channelId]} 
        joinChannel={joinChannel(channelId)} 
        channelMemberships={channelMemberships}
        users={users} 
      />);
    }

    if (!map.current || !isMapLoaded || !shouldUpdateMapData) return;
    // load channel data as map source 

    if (map.current.getSource('channels')) {
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
      setChannelPopup(null);
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

      getChannelMemberships(id);
       
      // Ensure that if the map is zoomed out such that
      // multiple copies of the feature are visible, the
      // popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      
      if (channelPopup && channelPopupRoot) {
        channelPopupRoot.render(<ChannelPopup 
          channel={channels[id]} 
          joinChannel={joinChannel(id)} 
          channelMemberships={channelMemberships}
          users={users} 
        />);

        channelPopup
          .setLngLat(coordinates);
      }
      else {
        const channelPopupNode = document.createElement('div');
        const root = createRoot(channelPopupNode);
        root.render(<ChannelPopup 
          channel={channels[id]} 
          joinChannel={joinChannel(id)} 
          channelMemberships={channelMemberships}
          users={users} />);

        const popup = new mapboxgl.Popup({
          offset: 15,
          focusAfterOpen: true,
          closeButton: false,
        })
        .setLngLat(coordinates)
        .setDOMContent(channelPopupNode)
        .addTo(map.current!);       

        setChannelId(id);
        setChannelPopup(popup);
        setChannelPopupRoot(root);
      }
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
    channelPopup, 
    channelMemberships,
    users,
  ])

  useEffect(() => {
    if (marker.current?.getPopup().isOpen()) return;
    marker.current?.togglePopup();
  }, [marker.current?.getPopup().isOpen()]);


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
      </IonContent>
    </IonPage>
  );
};

export default MapComponent;
