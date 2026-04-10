import { DataTypes, Model, CreationOptional } from 'sequelize';
import sequelize from '../config/sequelize';

class Message extends Model {
  declare id: CreationOptional<string>;
  declare eventId: number;
  declare userId: number;        
  declare content: string;
  declare type: 'public' | 'host'; 
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Message.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id'
  },
  type: {
    type: DataTypes.ENUM('public', 'host'),
    defaultValue: 'public',
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true,
  underscored: true, 
});

export default Message;