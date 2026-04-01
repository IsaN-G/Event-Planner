import { DataTypes, Model, CreationOptional } from 'sequelize';
import sequelize from '../config/sequelize';

class Message extends Model {
  declare id: CreationOptional<string>;
  declare eventId: number;
  declare userId: number;        // ← Geändert auf number, da unten INTEGER steht
  declare content: string;
  declare type: 'public' | 'host'; // ← Hier deklarieren
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
    type: DataTypes.INTEGER, // Deine DB nutzt hier offenbar Integer-IDs für User
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
  underscored: true, // Sorgt für created_at und updated_at in der DB
});

export default Message;