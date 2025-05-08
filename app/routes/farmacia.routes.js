import { authJwt } from "../middleware/index.js";
import medicamentoController from "../controllers/medicamento.controller.js";
import laboratorioController from "../controllers/laboratorio.controller.js";
import ordenCompraController from "../controllers/ordenCompra.controller.js";

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Rutas para Medicamentos
  app.post(
    "/api/medicamentos",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    medicamentoController.createMedicamento
  );

  app.get("/api/medicamentos", medicamentoController.findAllMedicamentos);

  app.get("/api/medicamentos/:id", medicamentoController.findOneMedicamento);

  app.put(
    "/api/medicamentos/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    medicamentoController.updateMedicamento
  );

  app.delete(
    "/api/medicamentos/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    medicamentoController.deleteMedicamento
  );

  // Rutas para Laboratorios
  app.post(
    "/api/laboratorios",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    laboratorioController.createLaboratorio
  );

  app.get("/api/laboratorios", laboratorioController.findAllLaboratorios);

  app.get("/api/laboratorios/:id", laboratorioController.findOneLaboratorio);

  app.put(
    "/api/laboratorios/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    laboratorioController.updateLaboratorio
  );

  app.delete(
    "/api/laboratorios/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    laboratorioController.deleteLaboratorio
  );

  // Rutas para Órdenes de Compra
  app.post(
    "/api/ordenes",
    [authJwt.verifyToken],
    ordenCompraController.createOrdenCompra
  );

  app.get(
    "/api/ordenes",
    [authJwt.verifyToken],
    ordenCompraController.findAllOrdenCompras
  );

  app.get(
    "/api/ordenes/:id",
    [authJwt.verifyToken],
    ordenCompraController.findOneOrdenCompra
  );

  app.put(
    "/api/ordenes/:id/estado",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    ordenCompraController.updateEstadoOrdenCompra
  );
}