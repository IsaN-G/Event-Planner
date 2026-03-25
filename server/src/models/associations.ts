import User from './User';
import Event from './Event';
import Registration from './Registration';


User.belongsToMany(Event, { through: Registration, foreignKey: 'userId', as: 'bookedEvents' });
Event.belongsToMany(User, { through: Registration, foreignKey: 'eventId', as: 'participants' });


User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Registration, { foreignKey: 'eventId' });
Registration.belongsTo(Event, { foreignKey: 'eventId' });

export { User, Event, Registration };