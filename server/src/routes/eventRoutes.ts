import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createEvent,
  getMyEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";

const router = Router();
router.get("/", getAllEvents);
router.get("/:id",getEventById); 
router.use(authMiddleware); 
router.post("/", createEvent);
router.get("/me", getMyEvents);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;