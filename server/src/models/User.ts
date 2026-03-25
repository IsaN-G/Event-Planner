import { DataTypes, Model, CreationOptional, NonAttribute } from "sequelize"; 
import sequelize from "../config/sequelize";
import bcrypt from "bcryptjs";
import Event from './Event'; 

class User extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: CreationOptional<"admin" | "user" | "organizer">;

 
  declare bookedEvents?: NonAttribute<Event[]>; 
}

User.init({

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { len: [3, 30] }
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: { isEmail: true }
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.STRING, 
    defaultValue: "user" 
  }
}, {
  sequelize,
  modelName: "User",
  tableName: "users",
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User;