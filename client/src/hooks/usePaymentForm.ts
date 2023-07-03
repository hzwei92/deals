
import { Preferences } from '@capacitor/preferences';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FormEvent } from 'react';
import { ACCESS_TOKEN_KEY } from '../constants';
 
function usePaymentForm(amountToCharge: number) {
  const stripe = useStripe();
  const elements = useElements();
 
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
 
    const cardElement = elements?.getElement(CardElement);
 
    if (!stripe || !elements || !cardElement) {
      return;
    }
 
    const stripeResponse = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    });
 
    const { error, paymentMethod } = stripeResponse;
 
    if (error || !paymentMethod) {
      return;
    }
 
    const paymentMethodId = paymentMethod.id;
 
    const accessToken = await Preferences.get({
      key: ACCESS_TOKEN_KEY,
    });
    
    const url = process.env.NODE_ENV === 'development' 
      ? import.meta.env.VITE_DEV_API_URL
      : '';

    fetch(`${url}/stripe/charge`, {
      method: 'POST',
      body: JSON.stringify(({
        paymentMethodId,
        amount: amountToCharge * 100,
      })),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'accesstoken': accessToken.value || '',
      },
    })
 
  };
 
  return {
    handleSubmit
  }
}
 
export default usePaymentForm;