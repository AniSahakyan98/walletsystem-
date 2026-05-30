import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./stripe";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>
);