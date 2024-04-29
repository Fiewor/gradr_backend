const userRouter = require("express").Router();
const userController = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");

userRouter.post("/signup", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/logout", isAuthenticated, userController.logoutUser);

module.exports = userRouter;
