import { gql, useMutation } from "@apollo/client";

const SET_USER_MAP = gql`
  mutation SetUserMap($lng: Float!, $lat: Float!,  $zoom: Float!) {
    setUserMap(lng: $lng, lat: $lat, zoom: $zoom) {
      id
      lng
      lat
      zoom
    }
  }
`;

const useSetUserMap = () => {
  const [set] = useMutation(SET_USER_MAP, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log('set user map', data);
    },
  });

  const setUserMap = (lng: number, lat: number, zoom: number) => { 
    console.log(zoom)
    set({ variables: { lat, lng, zoom } });
  }

  return setUserMap;
}

export default useSetUserMap;
