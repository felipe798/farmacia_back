const allAccess = (req, res) => {
    res.status(200).send("Contenido Público.");
  };
  
  const userBoard = (req, res) => {
    res.status(200).send("Contenido de Usuario.");
  };
  
  const adminBoard = (req, res) => {
    res.status(200).send("Contenido de Administrador.");
  };
  
  const moderatorBoard = (req, res) => {
    res.status(200).send("Contenido de Moderador.");
  };
  
  export default {
    allAccess,
    userBoard,
    adminBoard,
    moderatorBoard
  };