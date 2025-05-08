import jwt from "jsonwebtoken";
import db from "../models/index.js";
const User = db.user;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "¡No se proporcionó token!"
    });
  }

  jwt.verify(token, "farmacia-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "¡No autorizado!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "¡Requiere rol de administrador!"
    });
  } catch (error) {
    res.status(500).send({
      message: "No se pudo validar el rol de usuario."
    });
  }
};

const isModerator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "¡Requiere rol de moderador!"
    });
  } catch (error) {
    res.status(500).send({
      message: "No se pudo validar el rol de usuario."
    });
  }
};

const isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator" || roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "¡Requiere rol de moderador o administrador!"
    });
  } catch (error) {
    res.status(500).send({
      message: "No se pudo validar el rol de usuario."
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isModeratorOrAdmin
};

export default authJwt;