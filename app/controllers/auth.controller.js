import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const User = db.user;
const Role = db.role;

const signup = async (req, res) => {
  try {
    // Crear usuario
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });

    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [db.Sequelize.Op.or]: req.body.roles
          }
        }
      });

      await user.setRoles(roles);
      res.send({ message: "¡Usuario registrado exitosamente!" });
    } else {
      // Usuario por defecto = 1 (user)
      await user.setRoles([1]);
      res.send({ message: "¡Usuario registrado exitosamente!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      return res.status(404).send({ message: "¡Usuario no encontrado!" });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "¡Contraseña incorrecta!"
      });
    }

    const token = jwt.sign({ id: user.id }, "farmacia-secret-key", {
      expiresIn: 86400 // 24 horas
    });

    const authorities = [];
    const roles = await user.getRoles();
    
    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export default {
  signup,
  signin
};