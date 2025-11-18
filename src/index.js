import express from "express";
import empleadosRoutes from "./routes/empleados.js";
import authRoutes from "./routes/auth.js";
import asistenciaRoutes from "./routes/asistencia.js";
import incidenciasRoutes from "./routes/incidencias.js";
import horariosRoutes from "./routes/horarios.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "asistencia-backend" });
});

app.use("/auth", authRoutes);
app.use("/empleados", requireAuth, empleadosRoutes);
app.use("/asistencia", requireAuth, asistenciaRoutes);
app.use("/incidencias", requireAuth, incidenciasRoutes);
app.use("/horarios", requireAuth, horariosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
