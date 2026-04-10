import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import Message from "../models/Message";
import CreateHttpError from "http-errors";
import { User } from "../models";


export const getEventMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.eventId);

    const messages = await Message.findAll({
      where: { eventId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};


export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    
    if (!req.user) throw CreateHttpError(401, "Nicht autorisiert");

    const eventId = Number(req.params.eventId);
    const { content, type } = req.body; 
    
    const userId = req.user.id;
    const username = req.user.username;

    if (!content?.trim()) throw CreateHttpError(400, "Nachricht darf nicht leer sein");

    const message = await Message.create({
      eventId,
      userId,
      content: content.trim(),
      type: type || 'public' 
    });

    res.status(201).json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: { id: userId, username }
      }
    });
  } catch (error) {
    next(error);
  }
};


export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
  

      if (typeof messageId !== 'string') {
        throw CreateHttpError(400, "Ungültige Nachrichten-ID");
      }
  
      if (!req.user) throw CreateHttpError(401, "Nicht autorisiert");
  
      const userId = req.user.id;
      
    
      const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ message: "Nachricht nicht gefunden" });

    const isOwner = String(message.userId) === String(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw CreateHttpError(403, "Nicht berechtigt");
    }

    await message.destroy();
    res.json({ success: true, message: "Nachricht gelöscht" });
  } catch (error) {
    next(error);
  }
};


export const saveMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
  
    const userId = req.user!.id; 
    const { eventId, content, type } = req.body;

    const message = await Message.create({
      eventId,
      userId,
      content,
      type: type || 'public'
    });

    res.status(201).json(message);
  } catch (error) {
    next(error); 
  }
};