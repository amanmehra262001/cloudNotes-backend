const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

const JWT_SECRET = "abcdefg";

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post(
    "/createuser", [
        body("name").isLength({ min: 3 }),
        body("email").isEmail(),
        body("password").isLength({ min: 5 }),
    ],
    async(req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({
                    success,
                    error: "Sorry a user with this email already exists",
                });
            }
            const pass = req.body.password.toString();
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(pass, salt);
            console.log(secPass);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });

            const data = {
                user: {
                    id: user.id,
                },
            };

            const authToken = jwt.sign(data, JWT_SECRET);
            console.log({ user, authToken: authToken });
            success = true;
            res.json({ success, authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    }
);

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post(
    "/login", [
        body("email", "Please enter a valid email.").isEmail(),
        body("password", "Password can not be blank.").exists(),
    ],
    async(req, res) => {
        let success = false;
        // If there are errors then return bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                success = false;
                return res
                    .status(400)
                    .json({ success, error: "Please try to login with correct creds" });
            }
            const passwordConpare = await bcrypt.compare(
                password.toString(),
                user.password
            );
            if (!passwordConpare) {
                success = false;
                return res
                    .status(400)
                    .json({ success, error: "Please try to login with correct creds" });
            }
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            console.log({ user, authToken: authToken });
            success = true;
            res.json({ success, authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchUser, async(req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;