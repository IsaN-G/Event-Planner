import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
  bookEvent, 
  getMyBookings, 
  getEventParticipants 
} from '../controllers/bookingController';

const router = Router();

router.get('/event/:id', getEventParticipants);


router.use(authMiddleware);

router.post('/:id', bookEvent);


router.get('/my-tickets', getMyBookings);

export default router;