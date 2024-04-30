const request = require("request");

const details = {
  publicKey: process.env.SB_TEST_PUBLIC_KEY,
  paymentReference: "PAYMENT_REFERENCE",
  planId: "",
  cardNumber: "2223000000000007",
  expiryMonth: "05",
  redirectUrl: "https://checkout.seerbitapi.com",
  expiryYear: "21",
  cvv: "100",
  amount: "20",
  currency: "NGN",
  productDescription: "product description",
  productId: "productID",
  country: "NG",
  startDate: "2024-01-05 00:00:00",
  cardName: "Jane Smith",
  billingCycle: "DAILY",
  allowPartialDebit: "true",
  email: "js@emaildomain.com",
  mobileNumber: "09022323537",
  billingPeriod: "4",
  subscriptionAmount: false,
};

// Endpoint to handle the POST request to SeerBit API
exports.paymentHandler = function (req, res) {
  const details = req.body;
  const options = {
    method: "POST",
    url: "https://seerbitapi.com/api/v2/recurring/subscribes",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SB_TEST_ENCRYPTED_KEY}`,
    },
    body: JSON.stringify(details),
  };

  request(options, function (error, response) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log("res", response.body);
    res.status(200).send(response.body);
  });
}


