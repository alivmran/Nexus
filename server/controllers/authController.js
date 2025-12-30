const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const sendEmail = require('../utils/sendEmail');
    const {name, email, password, role} = req.body;

    try{
        const UserExists = await User.findOne({email});

        if(UserExists){
            return res.status(400).json({message: 'User Already Exists'});
        }
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

    const user = await User.create({
    name,
    email,
    password,
    role
});

if (user) {
    // --- START NEW EMAIL LOGIC ---
    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Nexus - Verify your Account',
            message: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #2563EB;">Welcome to Nexus!</h2>
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>Your account has been successfully created as an <strong>${user.role}</strong>.</p>
                    <p>You can now log in to accessing funding opportunities and secure meetings.</p>
                    <br>
                    <p style="color: #666; font-size: 12px;">If you did not create this account, please ignore this email.</p>
                </div>
            `
        });
        console.log(`Email sent to ${user.email}`);
    } catch (error) {
        console.error('Email could not be sent:', error.message);
        // We don't stop the registration if email fails, just log it
    }
    // --- END NEW EMAIL LOGIC ---

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
    } else {
    res.status(400).json({ message: 'Invalid user data' });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, authUser };