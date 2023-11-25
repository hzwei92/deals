import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonMenu, IonMenuToggle, IonPage, isPlatform, useIonRouter } from '@ionic/react';
import mapboxgl, { Map } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useContext, useEffect, useRef, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { selectChannels, selectFocusChannel, setFocusChannelId, toggleFocusChannelId } from '../slices/channelSlice';
import { selectAppUser, selectUsers } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { AppContext } from '../App';
import useGetChannels from '../hooks/useGetChannels';
import ChannelPopup from '../components/ChannelPopup';
import NewChannelPopup from '../components/NewChannelPopup';
import { selectMembershipsByUserId } from '../slices/membershipSlice';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ApolloProvider } from '@apollo/client';
import { client } from '../main';
import { closeOutline, save, star, starOutline } from 'ionicons/icons';
import { useSaveMembership } from '../hooks/useSaveMembership';
import { menuController } from '@ionic/core/components';
import useSetUserMap from '../hooks/useSetUserMap';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface MapComponentProps {}

const MapComponent: React.FC<MapComponentProps> = ({ }) => {
  const dispatch = useAppDispatch();

  const {
    streams,
    authModal,
    shouldUpdateMapData,
    setShouldUpdateMapData,
    newChannelLngLat,
    setNewChannelLngLat,
    channelMode,
    setChannelMode
  } = useContext(AppContext);

  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const [lng, setLng] = useState(-118.306);
  const [lat, setLat] = useState(34.115);
  const [zoom, setZoom] = useState(9);

  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const popupRoot = useRef<Root | null>(null);
  const creationPopupRoot = useRef<Root | null>(null);

  const users = useAppSelector(selectUsers);
  const channels = useAppSelector(selectChannels);

  const memberships = useAppSelector(state => selectMembershipsByUserId(state, user?.id ?? -1));
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const getChannels = useGetChannels(setShouldUpdateMapData);

  const setUserMap = useSetUserMap();

  useEffect(() => {
    if (user?.id && map.current) {
      map.current.easeTo({
        center: [user.lng, user.lat],
        zoom: user.zoom,
      })
    }
  }, [user?.id])

  const createChannel = () => {
    if (user?.id) {
      marker.current?.getPopup().remove();
      marker.current?.remove();
      console.log(router.routeInfo.pathname)
      router.push('/create-channel', 'none');
    }
    else {
      authModal?.current?.present();
    }
  };

  // set routing based on this upstream variable 
  const [nextChannelId, setNextChannelId] = useState<number | null>(-1);

  useEffect(() => {
    console.log('pathname', router.routeInfo.pathname, nextChannelId, channel?.id)
    if (!router.routeInfo.pathname.match(/^\/map/)) {
      return;
    }
    if (nextChannelId === -1) {
      return;
    }
    if (nextChannelId) {
      if (nextChannelId === (channel?.id ?? null)) {
        router.push('/map', 'none');
      }
      else { 
        router.push('/map/'+nextChannelId, 'none');
      }
    }
    else {
      if (router.routeInfo.pathname !== '/map') {
        router.push('/map', 'none');
      }
    }
    setNextChannelId(-1);
  }, [nextChannelId, channel?.id, router.routeInfo.pathname])
  
  // set focus channel based on routing
  useEffect(() => {
    const pattern1 = /^\/map\/(\d+)/;
    const match1 = router.routeInfo.pathname.match(pattern1);
    if (match1) {
      const id = parseInt(match1[1]);
      if (id !== channel?.id) {
        dispatch(setFocusChannelId(id));
      }
    }
    else {
      const pattern2 = /^\/channel\/(\d+)/;
      const match2 = router.routeInfo.pathname.match(pattern2);
      if (match2) {
        const id = parseInt(match2[1]);
        if (id !== channel?.id) {
          dispatch(setFocusChannelId(id));
        }
      }
      else {
        if (channel?.id) {
          dispatch(setFocusChannelId(null));
        }
      }
    }
  }, [router.routeInfo.pathname]);

  // fetch channels
  useEffect(() => {
    getChannels(lng, lat);
  }, []);



  // initialize map
  useEffect(() => {
    console.log('initializing map');
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      trackResize: true,
    });
    map.current.on('load', function () {
      console.log('map loaded');
      map.current?.resize();
      setIsMapLoaded(true);
    });    
    map.current.on('move', () => {
      if (map.current) {
        setLng(map.current.getCenter().lng);
        setLat(map.current.getCenter().lat);
        setZoom(map.current.getZoom());
      }
    });
    map.current.on('click', (e) => {
      setTimeout(() => {
        if (e.clickOnLayer) {
          return;
        }
        console.log('map click', e.lngLat);

        setNewChannelLngLat(e.lngLat);
        setNextChannelId(null);
      }, 100)
    });
  }, []);

  // update map data
  useEffect(() => {
    if (!map.current || !isMapLoaded || !shouldUpdateMapData) return;

    // load channel data as map source 

    if (map.current.getSource('channels')) {
      // remove existing layers and sources
      map.current.removeLayer('clusters');
      map.current.removeLayer('cluster-count');
      map.current.removeLayer('unclustered-point');
      map.current.removeLayer('unclustered-point-label')
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
            name: channel.name,
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
        'circle-radius': 12,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff' 
      } 
    });  


    map.current.addLayer({
      id: 'unclustered-point-label',
      type: 'symbol',
      source: 'channels',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Semibold'],
        'text-size': 14,
        'text-offset': [0, 1.5],
      }
  
    })

    map.current.on('click', 'clusters', (e) => {
      e.clickOnLayer = true;

      setNextChannelId(null);

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

      if (id) {
        setNextChannelId(id);
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

    map.current.on('moveend', () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      //getChannels(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
      const center = map.current.getCenter();
      setUserMap(center.lng, center.lat, map.current.getZoom());
    })

    map.current.on('zoomend', () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      //getChannels(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
      const center = map.current.getCenter();
      setUserMap(center.lng, center.lat, map.current.getZoom());
    });
      

    setShouldUpdateMapData(false);
  }, [
    isMapLoaded, 
    shouldUpdateMapData, 
    channels, 
    memberships,
    map.current?.getSource('channels'),
    users,
  ])

  const [resize, setResize] = useState(false);
  const channelPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [prevChannelId, setPrevChannelId] = useState<number | null>(null);

  // update, scroll to channel popup
  useEffect(() => {
    console.log('update channel popup', channel?.id, prevChannelId, channelMode, mapContainer.current?.clientWidth, mapContainer.current?.clientHeight);
    setPrevChannelId(channel?.id ?? null);

    if (channel?.id) {  
      if (channel?.id !== prevChannelId) {
        if (channel.lat !== lat || channel.lng !== lng) {
          map.current?.easeTo({
            center: [channel.lng, channel.lat],
          });
        }

        channelPopupRef.current?.remove();

        setNewChannelLngLat(null);
        const channelPopupNode = document.createElement('div')
        popupRoot.current = createRoot(channelPopupNode);
        popupRoot.current.render(
          <ApolloProvider client={client}>
            <Provider store={store}>
              <ChannelPopup 
                router={router} 
                authModal={authModal} 
                streams={streams}
                channelMode={channelMode}
                setChannelMode={setChannelMode}
              />
            </Provider>
          </ApolloProvider>
        );
        channelPopupRef.current = new mapboxgl.Popup({
          offset: 15,
          focusAfterOpen: true,
          closeButton: false,
        })
        .setLngLat([channel.lng, channel.lat])
        .setDOMContent(channelPopupNode)
        .addTo(map.current!);
      }
      else {
        popupRoot.current?.render(
          <ApolloProvider client={client}>
            <Provider store={store}>
              <ChannelPopup 
                router={router} 
                authModal={authModal} 
                streams={streams}
                channelMode={channelMode}
                setChannelMode={setChannelMode}
              />
            </Provider>
          </ApolloProvider>
        );
      }  
    }
    else {
      channelPopupRef.current?.remove();
      channelPopupRef.current = null;
    }
  }, [channel?.id, streams, channelMode, resize]);

  // update new channel marker/popup
  useEffect(() => {
    if (newChannelLngLat) {
      setNextChannelId(null);

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
  }, [newChannelLngLat, router.push]);

  const saveMembership = useSaveMembership();

  const handleChannelClick = (channelId: number) => () => {
    router.push('/map/'+channelId, 'none');
    menuController.close();
  }

  const handleRemoveClick = (membershipId: number) => (e: any) => {
    e.stopPropagation();
    saveMembership(membershipId, false);
  }

  useEffect(() => {
    // resize map
    map.current?.resize();
    // trigger update of channel popup
    setResize(prev => !prev);
  }, [mapContainer.current?.clientWidth, mapContainer.current?.clientHeight])

  return (
    <>
    <IonMenu type='overlay' menuId='map-menu' contentId='map-main-content'>
      <IonHeader style={{
        marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 105 : 50,
        padding: 10,
      }}>
        STARRED CHANNELS
      </IonHeader>
      <IonContent>
        {
          memberships
            .filter(m => m.isSaved || m.isOwner)
            .sort((a, b) => a.lastVisitedAt > b.lastVisitedAt ? -1 : 1)
            .map(m => {
              return (
                <IonCard key={m.id} onClick={handleChannelClick(m.channelId)} style={{
                  margin: 5,
                  padding: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      display: 'flex',
                    }}>
                      <div>
                        { channels[m.channelId].name }
                      </div>
                      &nbsp;
                      <div style={{
                        color: '#f4900c',
                      }}>
                        { m.isOwner ? '(owner)' : null }
                      </div>
                    </div>
                    {
                      channels[m.channelId].activeUserCount > 0
                        ? <div style={{
                            fontSize: 12,
                            color: '#f4900c',
                          }}>
                            { channels[m.channelId].activeUserCount } active 
                          </div>
                        : null
                    }
                  </div>
                  <IonButtons>
                    <IonButton onClick={handleRemoveClick(m.id)} disabled={m.isOwner}>
                      <IonIcon icon={closeOutline} />
                    </IonButton>
                  </IonButtons>
                </IonCard>
              )
            })

        }
      </IonContent>
    </IonMenu>
    <IonPage id={'map-main-content'}>
      <IonContent fullscreen style={{
        position: 'relative',
      }}>
        <div ref={mapContainer} className="map-container" style={{
          opacity: isMapLoaded ? 1 : 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position:'fixed',
        }} />
        <IonCard style={{
          position: 'fixed',
          borderRadius: 3,
          zIndex: 10,
          left: isPlatform('ios') ? -10 : 0,
          top: isPlatform('ios') 
            ? isPlatform('mobileweb') 
              ? 32
              : 92 
            : 52,
          padding: 10,
        }}>
          {
            channel?.id
              ? channels[channel.id].lng.toPrecision(6) + ', ' + channels[channel.id].lat.toPrecision(6)
              : newChannelLngLat
                ? newChannelLngLat?.lng.toPrecision(6) + ', ' + newChannelLngLat?.lat.toPrecision(6)
                : lng.toPrecision(6) + ', ' + lat.toPrecision(6) 
          }
        </IonCard>
        <IonCard style={{
          position: 'fixed',
          borderRadius: 3,
          zIndex: 10,
          left: isPlatform('ios') ? -10 : 0,
          top: isPlatform('ios') 
            ? isPlatform('mobileweb')
              ? 72
              : 142 
            : 92,
        }}>
        <IonMenuToggle autoHide={false}>
          <IonButtons>
              <IonButton >
                <IonIcon icon={star} size='small' />
              </IonButton>
          </IonButtons>
            </IonMenuToggle>
        </IonCard>
      </IonContent>
    </IonPage>
    </>
  );
};

export default MapComponent;
