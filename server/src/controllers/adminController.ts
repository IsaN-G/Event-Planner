import { Response, NextFunction } from "express";
import { User, Registration } from "../models"; 
import { AuthRequest } from "../types/auth";
import CreateHttpError from "http-errors";

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      include: [
        {
          model: Registration,
          as: 'registrations',           // ← Muss exakt mit dem Alias oben übereinstimmen
          attributes: [],
          required: false
        }
      ],
      group: ['User.id'],
      order: [['createdAt', 'DESC']]
    });

    const usersWithData = users.map((user: any) => {
      const plainUser = user.get({ plain: true });
      return {
        ...plainUser,
        bookedEventsCount: user.registrations ? user.registrations.length : 0,
        isActive: user.role === 'admin', 
        lastLogin: null
      };
    });

    res.json({
      success: true,
      users: usersWithData
    });
  } catch (error) {
    next(error);
  }
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

   
    const currentAdminId = String(req.user?.id || req.user?.sub);

    if (targetUserId === currentAdminId && role !== 'admin') {
      throw CreateHttpError(400, "Du kannst dir deine eigenen Admin-Rechte nicht selbst entziehen!");
    }

    await user.update({ role });

    res.json({ 
      success: true, 
      message: `Die Rolle von ${user.username} wurde auf '${role}' aktualisiert.` 
    });
  } catch (error) {
    next(error);
  }
};