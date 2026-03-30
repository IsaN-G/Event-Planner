import { Router } from "express";
import { register, login, updateHeartbeat } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/heartbeat", updateHeartbeat);
export default router;