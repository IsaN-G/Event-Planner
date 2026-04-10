import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { sendMessage, getEventMessages, deleteMessage} from "../controllers/chatController";

const router = Router();

router.use(authMiddleware);

router.get("/:eventId", getEventMessages);
router.post("/:eventId", sendMessage);
router.delete("/message/:messageId", deleteMessage);
export default router;