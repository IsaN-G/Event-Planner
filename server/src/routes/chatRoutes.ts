import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { sendMessage, getEventMessages, deleteMessage} from "../controllers/chatController";

const router = Router();

// Alle Chat-Routen sind geschützt (nur eingeloggte User)
router.use(authMiddleware);

router.get("/:eventId", getEventMessages);
router.post("/:eventId", sendMessage);
router.delete("/message/:messageId", authMiddleware, deleteMessage);
export default router;