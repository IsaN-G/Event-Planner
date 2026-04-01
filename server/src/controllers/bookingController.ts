import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { Registration, Event, User } from '../models'; 
import CreateHttpError from 'http-errors';

/**
 * 1. Einem Event beitreten (Ticket reservieren)
 */
export const bookEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.id); 
    const userId = req.user?.id;

    if (!userId) throw CreateHttpError(401, "Bitte logge dich ein.");

    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden.");

    // Prüfen, ob der User bereits angemeldet ist
    const existing = await Registration.findOne({ where: { userId, eventId } });
    if (existing) throw CreateHttpError(400, "Du bist bereits angemeldet.");

    // Kapazität prüfen
    const currentParticipants = await Registration.count({ where: { eventId } });
    if (currentParticipants >= event.maxParticipants) {
      throw CreateHttpError(400, "Event ist ausgebucht!");
    }

    // Registrierung erstellen
    await Registration.create({ userId, eventId });

    res.status(201).json({ 
      success: true, 
      message: "Ticket reserviert! 🎉" 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Alle Teilnehmer eines spezifischen Events abrufen (für die Liste im Frontend)
 */
export const getEventParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // Event ID aus der URL

    const participants = await Registration.findAll({
      where: { eventId: id },
      include: [{
        model: User,
        attributes: ['id', 'username'] // Nur notwendige Daten mitsenden
      }]
    });

    res.json(participants);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Alle Events abrufen, für die der aktuelle User angemeldet ist
 */
export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw CreateHttpError(401, "Nicht autorisiert.");

    const userWithEvents = await User.findByPk(userId, {
      include: [{
        model: Event,
        as: 'bookedEvents', 
        through: { attributes: [] } // Verknüpfungstabelle ausblenden
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