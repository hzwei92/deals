
import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import usePaymentForm  from '../hooks/usePaymentForm';
import { IonButton } from '@ionic/react';
 
interface PaymentFormProps {
  amountToCharge: number;
}

const PaymentForm = ({ amountToCharge }: PaymentFormProps) => {
  const { handleSubmit } = usePaymentForm(amountToCharge);
 
  return (
    <div style={{
      padding: 10,
    }}>
      <div style={{
        padding: 10,
      }}>
        <CardElement />
      </div>
      <IonButton onClick={handleSubmit}>Pay</IonButton>
    </div>
  );
};
 
export default PaymentForm;