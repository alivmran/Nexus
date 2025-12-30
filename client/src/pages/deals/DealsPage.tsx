import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// REPLACE WITH YOUR PUBLISHABLE KEY from Stripe Dashboard
const stripePromise = loadStripe('pk_test_...'); 

const CheckoutForm = ({ amount, onSuccess }: { amount: number, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        try {
            // 1. Get Client Secret from Backend
            const { data } = await axios.post('http://localhost:5000/api/payments/create-payment-intent', 
                { amount },
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')!).token}` } }
            );

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: { name: user?.name },
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Tell Backend to Update Balance
                    await axios.post('http://localhost:5000/api/payments/confirm', 
                        { amount, paymentId: result.paymentIntent.id },
                        { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')!).token}` } }
                    );
                    onSuccess();
                }
            }
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 border rounded-md">
                <CardElement />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={!stripe || loading} className="w-full">
                {loading ? 'Processing...' : `Pay $${amount}`}
            </Button>
        </form>
    );
};

export const DealsPage: React.FC = () => {
    const [amount, setAmount] = useState(50);
    const [balance, setBalance] = useState(0);

    const fetchBalance = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')!).token;
            const { data } = await axios.get('http://localhost:5000/api/payments/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(data.balance);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchBalance(); }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Wallet & Deals</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardBody>
                        <h2 className="text-lg font-medium">Current Balance</h2>
                        <p className="text-4xl font-bold text-primary-600 mt-2">${balance}</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <h2 className="text-lg font-medium mb-4">Deposit Funds (Stripe)</h2>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="border p-2 rounded mb-4 w-full"
                        />
                        <Elements stripe={stripePromise}>
                            <CheckoutForm amount={amount} onSuccess={() => {
                                alert('Payment Successful!');
                                fetchBalance();
                            }} />
                        </Elements>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};