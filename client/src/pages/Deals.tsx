import { gql, useMutation } from '@apollo/client';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useEffect } from 'react';
import DealListItem from '../components/DealListItem';
import { addDeals, selectDeals } from '../slices/dealSlice';
import { useAppDispatch, useAppSelector } from '../store';

const GET_DEALS = gql`
  mutation GetDeals {
    getDeals {
      id
      vendorId
      name
      detail
      quantity
      price
      image {
        data
      }
    }
  }
`;

const Deals: React.FC = () => {
  const dispatch = useAppDispatch();
  const deals = useAppSelector(selectDeals);

  const [getDeals] = useMutation(GET_DEALS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addDeals(data.getDeals));
    },
  });

  useEffect(() => {
    getDeals();
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          padding: 20,
          paddingBottom: 0,
        }}>
          {
            Object.entries(deals).map(([id, deal]) => {
              return (
                <DealListItem key={'deal' + id} deal={deal} />
              )
            })
          }
        </div>
        <IonFab vertical="bottom" horizontal="end" slot="fixed"> 
          <IonFabButton routerLink='/deal/create' style={{
            boxShadow: '0 5px 15px rgb(0 0 0 / 0.2)',
            borderRadius: '50%',
          }}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Deals;
