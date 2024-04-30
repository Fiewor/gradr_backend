const express = require("express");
const paymentController = require("../controllers/payment.controller");

const paymentRouter = express.Router();

paymentRouter.post("/subscribe", paymentController.paymentHandler);

module.exports = paymentRouter