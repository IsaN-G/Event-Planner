import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class Registration extends Model {
  public id!: number;
  public userId!: number;
  public eventId!: number;
}

Registration.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' } 
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'events', key: 'id' } 
  }
}, {
  sequelize,
  modelName: 'Registration',
  tableName: 'registrations',
  underscored: true, 
});

export default Registration;