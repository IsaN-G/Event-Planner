import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { Registration, Event, User } from '../models'; 
import CreateHttpError from 'http-errors';

export const bookEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.id); 
    const userId = req.user?.id;

    if (!userId) throw CreateHttpError(401, "Bitte logge dich ein.");

    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden.");

    const existing = await Registration.findOne({ where: { userId, eventId } });
    if (existing) throw CreateHttpError(400, "Du bist bereits angemeldet.");

    const currentParticipants = await Registration.count({ where: { eventId } });
    if (currentParticipants >= event.maxParticipants) {
      throw CreateHttpError(400, "Event ist ausgebucht!");
    }

    await Registration.create({ userId, eventId });

    res.status(201).json({ success: true, message: "Ticket reserviert! 🎉" });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw CreateHttpError(401, "Nicht autorisiert.");

    const userWithEvents = await User.findByPk(userId, {
      include: [{
        model: Event,
        as: 'bookedEvents', 
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      bookings: userWithEvents?.bookedEvents || []
    });
  } catch (error) {
    next(error);
  }
};