// models/index.ts
import sequelize from "../config/sequelize";
import User from "./User";
import Event from "./Event";
import Registration from "./Registration";

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

// Buchungen (Registration) - WICHTIG FÜR ADMIN
User.hasMany(Registration, {
  foreignKey: 'userId',
  as: 'registrations'           // ← Dieser Alias muss exakt so heißen
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

// Many-to-Many (für andere Queries)
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

export { sequelize, User, Event, Registration };