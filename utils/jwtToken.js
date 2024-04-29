// create token and saving that in cookies
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //24 hours
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  const userDetails = {
    _id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // res.cookie("token", token, options);
  res.status(statusCode).cookie("token", token, options).send({
    success: true,
    message: "Login successful.",
    userDetails,
    token,
  });
};

module.exports = sendToken;
