import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Import the centralized API helper instead of axios directly
import { API } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// REPLACE WITH YOUR PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51Sk0Vh2M9pWMpDCvFvSNLeYQcThnWzqpOPIQagwTE4MooyVlZXqNR6bGs8niIvYaznIjSMoe34dpqnkcoVxtMytD00UsCnQToT'); 

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
            // 1. Get Client Secret (Using centralized API)
            // Note: API.post automatically adds the Authorization header via interceptors
            const { data } = await API.post('/payments/create-payment-intent', { amount });

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
                    // 3. Update Balance (Using centralized API)
                    await API.post('/payments/confirm', { 
                        amount, 
                        paymentId: result.paymentIntent.id 
                    });
                    onSuccess();
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
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
            // Using centralized API
            const { data } = await API.get('/payments/balance');
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