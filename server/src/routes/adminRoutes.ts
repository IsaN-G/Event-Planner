import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/adminController";
import { updateHeartbeat } from "../controllers/authController"; 

const router = Router();

router.use(authMiddleware, isAdmin);


router.post("/heartbeat", updateHeartbeat); 

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;