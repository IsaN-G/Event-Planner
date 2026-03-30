import { Response, NextFunction } from "express";
import { User, Registration } from "../models"; 
import { AuthRequest } from "../types/auth";
import CreateHttpError from "http-errors";
import { Sequelize } from 'sequelize';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'email', 
        'role', 
        'createdAt', 
        'lastLogin', // WICHTIG: Muss in den Attributen stehen
        [Sequelize.fn('COUNT', Sequelize.col('registrations.id')), 'bookedEventsCount']
      ],
      include: [{ 
        model: Registration, 
        as: 'registrations', 
        attributes: [], 
        required: false 
      }],
      group: ['User.id'],
      order: [['createdAt', 'DESC']]
    });

    const usersWithData = users.map((user: any) => {
      const plainUser = user.get({ plain: true });
      
      // LOGIK FÜR DEN ONLINE-STATUS:
      // Wir prüfen, ob der letzte Login weniger als 15 Minuten her ist
      const isActuallyOnline = plainUser.lastLogin 
        ? (new Date().getTime() - new Date(plainUser.lastLogin).getTime()) < 15 * 60 * 1000
        : false;

      return {
        ...plainUser,
        bookedEventsCount: parseInt(plainUser.bookedEventsCount || '0'),
        isActive: isActuallyOnline // Wenn true, leuchtet der Punkt im Frontend grün
      };
    });

    res.json({ success: true, users: usersWithData });
  } catch (error) { 
    next(error); 
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user?.id) {
      throw CreateHttpError(400, "Du kannst dein eigenes Admin-Konto nicht löschen.");
    }
    await User.destroy({ where: { id } });
    res.json({ success: true, message: "Benutzer dauerhaft gelöscht." });
  } catch (error) { next(error); }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = String(req.params.id);
    const { role } = req.body;

    const validRoles = ['user', 'organizer', 'admin'];
    if (!validRoles.includes(role)) {
      throw CreateHttpError(400, "Ungültige Rolle angegeben.");
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      throw CreateHttpError(404, "Benutzer nicht gefunden.");
    }

    if (Number(targetUserId) === req.user?.id && role !== 'admin') {
      throw CreateHttpError(400, "Du kannst dir deine eigenen Admin-Rechte nicht entziehen!");
    }

    await user.update({ role });
    res.json({ success: true, message: `Rolle aktualisiert.` });
  } catch (error) { next(error); }
};

// adminController.ts
export const updateHeartbeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    await User.update({ lastLogin: new Date() }, { where: { id: userId } });
    res.json({ success: true });
  } catch (error) { next(error); }
};