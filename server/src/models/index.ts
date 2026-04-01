// models/index.ts
import sequelize from "../config/sequelize";
import User from "./User";
import Event from "./Event";
import Registration from "./Registration";
import Message from "./Message";

// Organizer Beziehung
User.hasMany(Event, {
  foreignKey: "organizerId",
  as: "organizedEvents",
  onDelete: "CASCADE",
});

Event.belongsTo(User, {
  foreignKey: "organizerId",
  as: "organizer",
});

// Buchungen
User.hasMany(Registration, {
  foreignKey: 'userId',
  as: 'registrations'
});

Registration.belongsTo(User, {
  foreignKey: 'userId'
});

Event.hasMany(Registration, {
  foreignKey: 'eventId',
  as: 'registrations'
});

Registration.belongsTo(Event, {
  foreignKey: 'eventId'
});

// Many-to-Many für Bookings
User.belongsToMany(Event, {
  through: Registration,
  foreignKey: 'userId',
  otherKey: 'eventId',
  as: 'bookedEvents'
});

Event.belongsToMany(User, {
  through: Registration,
  foreignKey: 'eventId',
  otherKey: 'userId',
  as: 'participants'
});

// ====================== CHAT BEZIEHUNGEN ======================
User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages'
});

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'sender'
});

Event.hasMany(Message, {
  foreignKey: 'eventId',
  as: 'messages'
});

Message.belongsTo(Event, {
  foreignKey: 'eventId'
});

export { sequelize, User, Event, Registration, Message };