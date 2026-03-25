import { Request, Response, NextFunction } from "express";
import CreateHttpError from "http-errors";
import { Event, User, Registration } from '../models';
import { AuthRequest } from "../types/auth";

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.findAll({
      order: [["startDate", "ASC"]],
      include: [{
        model: User,
        as: "organizer",
        attributes: ["id", "username"],
      }],
    });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, startDate, endDate, location, maxParticipants, imageUrl, category } = req.body;
    const organizerId = req.user?.id;

    if (new Date(startDate) >= new Date(endDate)) {
      throw CreateHttpError(400, "Das Event muss nach dem Start enden.");
    }

    const event = await Event.create({
      title,
      description: description || "Keine Beschreibung vorhanden.",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      maxParticipants: maxParticipants || 100,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      category: category || "Allgemein",
      organizerId,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.user?.id;

    const event = await Event.findByPk(eventId, {
      include: [{ 
        model: User, 
        as: 'organizer', 
        attributes: ['id', 'username'] 
      }]
    });

    if (!event) throw CreateHttpError(404, "Event nicht gefunden.");

    const participantCount = await Registration.count({ where: { eventId } });
    const isFull = participantCount >= event.maxParticipants;

    let isBooked = false;
    if (userId) {
      const existingRegistration = await Registration.findOne({
        where: { userId, eventId }
      });
      isBooked = !!existingRegistration;
    }

    res.json({
      success: true,
      event,
      isBooked,
      isFull,
      currentParticipants: participantCount
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const events = await Event.findAll({ 
      where: { organizerId: userId }, 
      order: [["startDate", "ASC"]] 
    });
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.id);
    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden");

    const userId = req.user?.id;
    if (event.organizerId !== userId && req.user?.role !== 'admin') {
      throw CreateHttpError(403, "Keine Berechtigung");
    }

    await event.update(req.body);
    res.json({ success: true, message: "Aktualisiert", event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.id);
    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden");

    const userId = req.user?.id;
    if (event.organizerId !== userId && req.user?.role !== 'admin') {
      throw CreateHttpError(403, "Keine Berechtigung");
    }

    await event.destroy();
    res.json({ success: true, message: "Gelöscht" });
  } catch (error) {
    next(error);
  }
};



