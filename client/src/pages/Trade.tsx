import { gql, useMutation } from '@apollo/client';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useContext, useEffect } from 'react';
import DealListItem from '../components/DealListItem';
import { addDeals, selectDeals } from '../slices/dealSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { AppContext } from '../App';
import { selectAppUser } from '../slices/userSlice';
import AuthModal from '../components/AuthModal';
import AccountModal from '../components/AccountModal';
import AppBar from '../components/AppBar';

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

const Trade: React.FC = () => {
  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const { authModal } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);

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

  const handleClick = () => {
    if (user?.id) {
      router.push('/create-deal')
    }
    else { 
      authModal.current?.present();
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          padding: 10,
          backgroundColor: '#222222',
          minHeight: '100%',
        }}>
          {
            Object.values(deals).map(deal => {
              return (
                <DealListItem key={'deal' + deal.id} deal={deal} />
              )
            })
          }
        </div>
        <IonFab vertical="bottom" horizontal="end" slot="fixed"> 
          <IonFabButton onClick={handleClick} size='small' style={{
            boxShadow: '0 5px 15px rgb(0 0 0 / 0.2)',
            borderRadius: '50%',
          }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Trade;
