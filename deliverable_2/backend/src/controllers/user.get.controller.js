import { User } from "../models/users.js";

// GET methods
export const getAll = async (req, res) => {
    try {
        const users = await User.find();

        return res.status(200).json({
            message: "Users retrieved successfully",
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        
        return res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getFiltered = async (req, res) => {
    try {
      const { username, email, loggedIn } = req.query;
  
      const filter = {};
  
      if (username) {
        filter.username = username.toLowerCase();
      }
  
      if (email) {
        filter.email = email.toLowerCase();
      }
  
      if (loggedIn !== undefined) {
        filter.loggedIn = loggedIn === "true"; // query params are strings
      }
  
      const users = await User.find(filter);
  
      return res.status(200).json({
        message: "Users retrieved successfully",
        users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                message: "Query parameter 'query' is required",
            });
        }

        const regex = new RegExp(query, "i");

        const users = await User.find({
            $or: [{ username: regex }, { email: regex }],
        });

        return res.status(200).json({
            message: "Users retrieved successfully",
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.header("x-user-id");

        if (!userId) {
            return res.status(400).json({
                message: "Missing 'x-user-id' header",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Current user retrieved successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({
                message: "Username parameter is required",
            });
        }

        if (username.length < 4 || username.length > 40) {
            return res.status(400).json({
                message: "Username must be between 4 and 40 characters",
                available: false,
            });
        }

        const existing = await User.findOne({
            username: username.toLowerCase(),
        });

        return res.status(200).json({
            message: "Username availability checked",
            available: !existing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                message: "Email parameter is required",
            });
        }

        if (email.length < 4 || email.length > 40) {
            return res.status(400).json({
                message: "Email must be between 4 and 40 characters",
                available: false,
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email format is invalid",
                available: false,
            });
        }

        const existing = await User.findOne({
            email: email.toLowerCase(),
        });

        return res.status(200).json({
            message: "Email availability checked",
            available: !existing,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


