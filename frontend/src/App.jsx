import { useState } from "react";
import axios from "axios";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function App() {
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const stripe = useStripe();
  const elements = useElements();

  // STEP 1 → create PaymentIntent
  const createTopUp = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please login again.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/wallet/topUp",
        {
          amount: Number(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Backend response =>", res.data);

      setClientSecret(res.data.clientSecret);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  // STEP 2 → confirm payment
  const pay = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    if (!clientSecret) {
      alert("Missing clientSecret. Create payment first.");
      return;
    }

    const card = elements.getElement(CardElement);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    });

    console.log("Payment result =>", result);

    if (result.error) {
      alert(result.error.message);
    }

    if (result.paymentIntent?.status === "succeeded") {
      alert("Payment Successful 🎉");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Wallet Top Up</h2>

      {/* Amount input */}
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={createTopUp} style={{ marginLeft: 10 }}>
        Create Payment
      </button>

      {/* Stripe form */}
      {clientSecret && (
        <form onSubmit={pay} style={{ marginTop: 20 }}>
          <CardElement />

          <button type="submit" style={{ marginTop: 10 }}>
            Pay
          </button>
        </form>
      )}
    </div>
  );
}

export default App;