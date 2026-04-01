import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/cloudinary"; // Diese Datei erstellen wir als Nächstes
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

// 1. Öffentliche Routen
router.get("/", getAllEvents);

// 2. Auth-geschützte Routen (spezifische Pfade zuerst)
router.get("/me", authMiddleware, getMyEvents); 
router.get("/analytics", authMiddleware, getEventAnalytics);

// 3. Einzel-Event-Ansicht
router.get("/:id", getEventById); 

// 4. Aktionen, die Login erfordern
router.use(authMiddleware); 

// WICHTIG: upload.single('image') ermöglicht den Bildupload für POST und PUT
router.post("/", upload.single('image'), createEvent);
router.put("/:id", upload.single('image'), updateEvent);
router.delete("/:id", deleteEvent);

export default router;