import { gql, useMutation } from "@apollo/client";
import { Elements,} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { Deal } from "../types/Deal";
import CheckoutForm from "./CheckoutForm";

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($price: Int!) {
    createPaymentIntent(price: $price)
  }
`;

const apiKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(apiKey!);

interface CheckoutProps {
  deal: Deal;
};

const Checkout: React.FC<CheckoutProps> = ({ deal }) =>{
  const [clientSecret, setClientSecret] = useState('');

  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      setClientSecret(data.createPaymentIntent);
    }
  });

  useEffect(() => {
    createPaymentIntent({variables: {price: deal.price * 100}});
  }, []);

  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  } as any;

  if (!clientSecret) return null;

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm deal={deal} />
    </Elements>
  );
}

export default Checkout;