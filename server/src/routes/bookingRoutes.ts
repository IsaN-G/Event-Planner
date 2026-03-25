import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { bookEvent, getMyBookings } from '../controllers/bookingController';

const router = Router();


router.use(authMiddleware);
router.post('/:id', bookEvent);
router.get('/my-tickets', getMyBookings);

export default router;