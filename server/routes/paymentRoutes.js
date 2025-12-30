const express = require('express');
const { createPaymentIntent, confirmDeposit, getHistory, getBalance } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmDeposit);
router.get('/history', protect, getHistory);
router.get('/balance', protect, getBalance);

module.exports = router;