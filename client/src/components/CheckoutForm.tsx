import { gql, useMutation } from "@apollo/client";
import { IonButton, IonCard } from "@ionic/react";
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { Deal } from "../types/Deal";

interface CheckoutFormProps {
  deal: Deal;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ deal }) =>{
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret1 = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret1) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret1).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: process.env.NODE_ENV === 'development'
          ? "http://localhost:8100/home"
          : "https://jamn.io/home",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || '');
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs"
  } as any;

  return (
    <IonCard style={{
      margin: 0,
      backgroundColor: 'white',
      padding: 10,
    }}>
      <div style={{
        fontSize: 24,
        marginBottom: 10,
      }}>
        ${deal.price}
      </div>
      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail((e as any)?.target?.value)}
      />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <div style={{
        paddingTop: 10,
      }}>
        <IonButton disabled={isLoading || !stripe || !elements} onClick={handleSubmit}>
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "PAY NOW"}
          </span>
        </IonButton>
      </div>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </IonCard>
  );
}

export default CheckoutForm;