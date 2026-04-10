import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/cloudinary"; 
import {
  createEvent,
  getMyEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
  updateStatus
} from "../controllers/eventController";

const router = Router();

router.get("/", getAllEvents);


router.get("/me", authMiddleware, getMyEvents); 
router.get("/analytics", authMiddleware, getEventAnalytics);


router.get("/:id", getEventById); 


router.use(authMiddleware); 
router.patch('/:id/status', authMiddleware,updateStatus);

router.post("/", upload.single('image'), createEvent);
router.put("/:id", upload.single('image'), updateEvent);
router.delete("/:id", deleteEvent);

export default router;