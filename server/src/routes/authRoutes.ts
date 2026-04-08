import { Router } from "express";
import { register, login, updateHeartbeat, refreshToken, logout } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/heartbeat", updateHeartbeat);

export default router;