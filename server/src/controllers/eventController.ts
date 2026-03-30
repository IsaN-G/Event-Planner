// eventController.ts
import { Request, Response, NextFunction } from "express";
import CreateHttpError from "http-errors";
import { Event, User, Registration } from '../models';
import { AuthRequest } from "../types/auth";
import { Sequelize } from 'sequelize';

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

    if (!organizerId) throw CreateHttpError(401, "Nicht autorisiert");

    if (new Date(startDate) >= new Date(endDate)) {
      throw CreateHttpError(400, "Das Event muss nach dem Start enden.");
    }

    const event = await Event.create({
      title,
      description: description || "Keine Beschreibung vorhanden.",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      maxParticipants: Number(maxParticipants) || 100,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      category: category || "Allgemein",
      organizerId,
    });

    const createdEvent = await Event.findByPk(event.id, {
      include: [{ model: User, as: "organizer", attributes: ["id", "username"] }],
    });

    res.status(201).json({ success: true, message: "Event erstellt", event: createdEvent });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.user?.id;

    const event = await Event.findByPk(eventId, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'username'] }]
    });

    if (!event) throw CreateHttpError(404, "Event nicht gefunden.");

    const participantCount = await Registration.count({ where: { eventId } });
    const isFull = participantCount >= event.maxParticipants;

    let isBooked = false;
    if (userId) {
      const existing = await Registration.findOne({ where: { userId, eventId } });
      isBooked = !!existing;
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
    if (!userId) throw CreateHttpError(401, "Nicht autorisiert");

    const events = await Event.findAll({
      where: { organizerId: userId },
      include: [{ model: Registration, as: 'registrations', attributes: [] }],
      attributes: {
        include: [[Sequelize.fn("COUNT", Sequelize.col("registrations.id")), "bookingsCount"]]
      },
      group: ['Event.id'],
      order: [["startDate", "ASC"]]
    });

    const formatted = events.map((e: any) => ({
      ...e.get({ plain: true }),
      bookingsCount: parseInt(e.get('bookingsCount') || '0')
    }));

    res.json({ success: true, events: formatted });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden");

    if (event.organizerId !== Number(userId) && userRole !== 'admin') {
      throw CreateHttpError(403, "Keine Berechtigung");
    }

    await event.update(req.body);

    const updated = await Event.findByPk(eventId, {
      include: [{ model: User, as: "organizer", attributes: ["id", "username"] }]
    });

    res.json({ success: true, message: "Event aktualisiert", event: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const event = await Event.findByPk(eventId);
    if (!event) throw CreateHttpError(404, "Event nicht gefunden");

    if (event.organizerId !== Number(userId) && userRole !== 'admin') {
      throw CreateHttpError(403, "Keine Berechtigung");
    }

    await event.destroy();
    res.json({ success: true, message: "Event gelöscht" });
  } catch (error) {
    next(error);
  }
};

export const getEventAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.id;
    if (!organizerId) throw CreateHttpError(401, "Nicht autorisiert");

    const totalEvents = await Event.count({ where: { organizerId } });
    const totalBookings = await Registration.count({
      include: [{ model: Event, where: { organizerId }, attributes: [] }]
    });

    const eventsWithBookings = await Event.findAll({
      where: { organizerId },
      include: [{ model: Registration, as: 'registrations', attributes: [] }],
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('registrations.id')), 'bookingsCount']]
      },
      group: ['Event.id'],
      order: [[Sequelize.literal('"bookingsCount"'), 'DESC']]
    });

    const topEvents = eventsWithBookings.slice(0, 5).map((e: any) => {
      const count = parseInt(String(e.get('bookingsCount') || '0'));
      return {
        id: e.id,
        title: e.title,
        bookingsCount: count,
        maxParticipants: e.maxParticipants,
        occupancy: e.maxParticipants > 0 ? Math.round((count / e.maxParticipants) * 100) : 0,
        category: e.category
      };
    });

    const avgOccupancy = eventsWithBookings.length > 0
      ? Math.round(
          eventsWithBookings.reduce((sum, e) => {
            const c = parseInt(String(e.get('bookingsCount') || '0'));
            return sum + (e.maxParticipants > 0 ? (c / e.maxParticipants) * 100 : 0);
          }, 0) / eventsWithBookings.length
        )
      : 0;

    const categoryStats = await Event.findAll({
      where: { organizerId },
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['category']
    });

    res.json({
      success: true,
      totalEvents,
      totalBookings,
      averageOccupancy: avgOccupancy,
      topEvents,
      categoryStats: categoryStats.map((c: any) => ({
        category: c.category,
        count: parseInt(String(c.get('count') || '0'))
      }))
    });
  } catch (error) {
    next(error);
  }
};
