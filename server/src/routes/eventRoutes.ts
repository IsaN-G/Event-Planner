import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createEvent,
  getMyEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
} from "../controllers/eventController";

const router = Router();

// 1. Öffentliche "Entdecken" Route (Alle Events)
router.get("/", getAllEvents);

// 2. Auth-geschützte Routen (Diese müssen VOR der :id Route stehen!)
// Wir nutzen hier "/me" oder "/my-events"
router.get("/me", authMiddleware, getMyEvents); 
router.get("/analytics", authMiddleware, getEventAnalytics);
// 3. Einzel-Event-Ansicht (Die :id Route muss nach unten!)
router.get("/:id", getEventById); 

// 4. Aktionen, die einen Login erfordern
router.use(authMiddleware); 
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;