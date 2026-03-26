import sequelize from "../config/sequelize";
import User from "./User";
import Event from "./Event";
import Registration from "./Registration";


User.hasMany(Event, {
  foreignKey: "organizerId",
  as: "organizedEvents",
  onDelete: "CASCADE",
});

Event.belongsTo(User, {
  foreignKey: "organizerId",
  as: "organizer",
});

// Ein Event hat viele Registrierungen
Event.hasMany(Registration, { 
  foreignKey: 'eventId', 
  as: 'registrations' 
});

// Eine Registrierung gehört zu einem Event
Registration.belongsTo(Event, { 
  foreignKey: 'eventId', 
  as: 'event' 
});

User.belongsToMany(Event, { 
  through: Registration, 
  foreignKey: "userId", 
  otherKey: "eventId",
  as: "bookedEvents",
  onDelete: "CASCADE"
});

Event.belongsToMany(User, { 
  through: Registration, 
  foreignKey: "eventId", 
  otherKey: "userId",
  as: "participants",
  onDelete: "CASCADE"
});

export { sequelize, User, Event, Registration };