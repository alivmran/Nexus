const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// FIX: Initialize Stripe only if the key exists, or fail gracefully
// This prevents the entire server from crashing on startup
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing in .env file");
}

// 1. Create Payment Intent
const createPaymentIntent = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server." });
    }

    const { amount } = req.body; 

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, 
            currency: 'usd',
            metadata: { userId: req.user.id }
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Confirm Deposit
const confirmDeposit = async (req, res) => {
    const { amount, paymentId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.walletBalance += Number(amount);
        await user.save();

        await Transaction.create({
            user: userId,
            type: 'deposit',
            amount,
            status: 'completed',
            description: `Stripe Deposit (ID: ${paymentId})`
        });

        res.status(200).json({ balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: 'Deposit confirmation failed' });
    }
};

const getHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createPaymentIntent, confirmDeposit, getHistory, getBalance };