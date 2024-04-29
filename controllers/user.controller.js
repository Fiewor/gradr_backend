const User = require("../models/user.model");
const sendToken = require("../utils/jwtToken");

// User registration
exports.registerUser = async (req, res) => {
  // Extract user data from request body
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ msg: "User already exists" });
    }

    // Create new user instance
    user = new User({
      username,
      email,
      password,
    });

    // Save user to database
    await user.save();

    res.status(201).send({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).send(err.message || "Server Error");
  }
};

// User login
exports.loginUser = async (req, res) => {
  // Extract user data from request body
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ msg: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ message: "Please provide the correct information" });
    }

    sendToken(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Server Error");
  }
};

// log out user
exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).send({
      success: true,
      message: "Log out successful!",
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
