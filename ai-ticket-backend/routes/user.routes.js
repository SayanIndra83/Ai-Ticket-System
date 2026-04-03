import express from "express"
import { getUsers, loginUser, logoutUser, registerUser, updateUser } from "../controllers/user.controllers.js"
import { isAuthinticated } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/update-user", isAuthinticated, updateUser)
router.post("/users", isAuthinticated, getUsers)

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.post("/logout", isAuthinticated, logoutUser)

export default router