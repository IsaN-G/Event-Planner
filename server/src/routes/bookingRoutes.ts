import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
  bookEvent, 
  getMyBookings, 
  getEventParticipants // NEU hinzugefügt
} from '../controllers/bookingController';

const router = Router();

// 1. Öffentlich zugänglich: Teilnehmerliste eines Events sehen
router.get('/event/:id', getEventParticipants);

// 2. Ab hier alle Routen schützen
router.use(authMiddleware);

// Ticket für ein Event buchen (POST /api/bookings/123)
router.post('/:id', bookEvent);

// Eigene Tickets abrufen (GET /api/bookings/my-tickets)
router.get('/my-tickets', getMyBookings);

export default router;