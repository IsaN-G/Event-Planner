import { DataTypes, Model, CreationOptional, ForeignKey, NonAttribute } from "sequelize";
import sequelize from "../config/sequelize";
import User from "./User";

class Event extends Model {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description?: string;
  declare startDate: Date;
  declare endDate: Date;
  declare location: string;
  declare maxParticipants: number;
  declare category: string;
  declare imageUrl?: string;
  declare organizerId: ForeignKey<User["id"]>;
  declare organizer?: NonAttribute<User>;
}

Event.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "Keine Beschreibung vorhanden."
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: { 
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100 
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Allgemein"
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" }
  }
}, {
  sequelize,
  modelName: "Event",
  tableName: "events",
  timestamps: true,
  underscored: true,
});

export default Event;