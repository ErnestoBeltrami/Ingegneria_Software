import { User } from "../models/users.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password){
            return res.status(400).json({
                message: "All fields required"
            })
        }
        const existing = await User.findOne({email: email.toLowerCase() })
        if (existing) {
            return res.status(400).json({
                message: "User already exists!"
            });
        } 
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            loggedIn: false,
        });

        res.status(201).json({ 
            message: "User registered succesfully",
            user: { 
                id: user._id,
                email: user.email,
                username: user.username,
                loggedIn: user.loggedIn
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(400).json({
            message: "User not found"
        });

        const isMatching = await user.comparePassword(password);
        if (!isMatching) return res.status(400).json({
            message: "Invalid credentials",
        })

        res.status(200).json({
            message: "Logged in",
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(400).json({
            message: "Couldnt find user with this email"
        })

        const isMatching = await user.comparePassword(password);
        if (!isMatching) return res.status(400).json({
            message: "Invalid credentials",
        })

        user.loggedIn = false
        await user.save();

        res.status(200).json({
            message: "Succesfully logged out",
        })
        
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

export {
    registerUser, 
    loginUser,
    logoutUser
};
    