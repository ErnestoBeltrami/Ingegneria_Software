import { Router } from "express";
import {
        getAll, 
        getById, 
        getByEmail, 
        getByUsername, 
        getFiltered,
        searchUsers,
        getCurrentUser,
        checkUsernameAvailability,
        checkEmailAvailability,
        loginUser, 
        logoutUser, 
        registerUser
} from "../controllers/user.controller.js";


const router = Router();

// GET methods
router.route('/getAll').get(getAll);
router.route('/getById/:id').get(getById);
router.route('/getByEmail/:email').get(getByEmail);
router.route('/getByUsername/:username').get(getByUsername);
router.route('/getFiltered').get(getFiltered);
router.route('/search').get(searchUsers);
router.route('/me').get(getCurrentUser);
router.route('/check-username/:username').get(checkUsernameAvailability);
router.route('/check-email/:email').get(checkEmailAvailability);

// POST methods
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);

export default router;
