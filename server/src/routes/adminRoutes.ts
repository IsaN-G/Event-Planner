import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { getAllUsers, updateUserRole } from "../controllers/adminController";

const router = Router();


router.use(authMiddleware, isAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

export default router;