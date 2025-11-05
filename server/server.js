import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getAllTables,
  getTableData,
  // Missions
  getAllMissions, insertMission, updateMission, deleteMission,
  // Agencies
  getAllAgencies, insertAgency, updateAgency, deleteAgency,
  // Crew Members
  getAllCrewMembers, insertCrewMember, updateCrewMember, deleteCrewMember,
  // Crew Assignments
  getAllCrewAssignments, insertCrewAssignment, updateCrewAssignment, deleteCrewAssignment,
  // Launches
  getAllLaunches, insertLaunch, updateLaunch, deleteLaunch,
  // Payloads
  getAllPayloads, insertPayload, updatePayload, deletePayload,
  // Rockets
  getAllRockets, insertRocket, updateRocket, deleteRocket,
  // Rocket Variants
  getAllRocketVariants, insertRocketVariant, updateRocketVariant, deleteRocketVariant,
  // Manufacturers
  getAllManufacturers, insertManufacturer, updateManufacturer, deleteManufacturer,
} from "./dbQueries.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Root & Health check
app.get("/", (_req, res) => {
  res.send("🚀 OrbitBase API is live and running!");
});

// ✅ Utility routes
app.get("/api/tables", async (_req, res) => {
  try {
    const tables = await getAllTables();
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/table/:name", async (req, res) => {
  try {
    const result = await getTableData(req.params.name);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🚀 MISSIONS */
/* -------------------------------------------------------------------------- */
app.get("/api/missions", async (_req, res) => {
  try {
    const data = await getAllMissions();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/missions", async (req, res) => {
  try {
    await insertMission(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/missions/:id", async (req, res) => {
  try {
    await updateMission(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/missions/:id", async (req, res) => {
  try {
    await deleteMission(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🏢 AGENCIES */
/* -------------------------------------------------------------------------- */
app.get("/api/agencies", async (_req, res) => {
  try {
    res.json(await getAllAgencies());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/agencies", async (req, res) => {
  try {
    await insertAgency(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/agencies/:id", async (req, res) => {
  try {
    await updateAgency(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/agencies/:id", async (req, res) => {
  try {
    await deleteAgency(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 👩‍🚀 CREW MEMBERS */
/* -------------------------------------------------------------------------- */
app.get("/api/crew_members", async (_req, res) => {
  try {
    res.json(await getAllCrewMembers());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/crew_members", async (req, res) => {
  try {
    await insertCrewMember(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/crew_members/:id", async (req, res) => {
  try {
    await updateCrewMember(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/crew_members/:id", async (req, res) => {
  try {
    await deleteCrewMember(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🧑‍🚀 CREW ASSIGNMENTS */
/* -------------------------------------------------------------------------- */
app.get("/api/crew_assignments", async (_req, res) => {
  try {
    res.json(await getAllCrewAssignments());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/crew_assignments", async (req, res) => {
  try {
    await insertCrewAssignment(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/crew_assignments/:id", async (req, res) => {
  try {
    await updateCrewAssignment(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/crew_assignments/:id", async (req, res) => {
  try {
    await deleteCrewAssignment(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🚀 LAUNCHES */
/* -------------------------------------------------------------------------- */
app.get("/api/launches", async (_req, res) => {
  try {
    res.json(await getAllLaunches());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/launches", async (req, res) => {
  try {
    await insertLaunch(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/launches/:id", async (req, res) => {
  try {
    await updateLaunch(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/launches/:id", async (req, res) => {
  try {
    await deleteLaunch(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🛰️ PAYLOADS */
/* -------------------------------------------------------------------------- */
app.get("/api/payloads", async (_req, res) => {
  try {
    res.json(await getAllPayloads());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/payloads", async (req, res) => {
  try {
    await insertPayload(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/payloads/:id", async (req, res) => {
  try {
    await updatePayload(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/payloads/:id", async (req, res) => {
  try {
    await deletePayload(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🚀 ROCKETS */
/* -------------------------------------------------------------------------- */
app.get("/api/rockets", async (_req, res) => {
  try {
    res.json(await getAllRockets());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/rockets", async (req, res) => {
  try {
    await insertRocket(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/rockets/:id", async (req, res) => {
  try {
    await updateRocket(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/rockets/:id", async (req, res) => {
  try {
    await deleteRocket(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🧱 ROCKET VARIANTS */
/* -------------------------------------------------------------------------- */
app.get("/api/rocket_variants", async (_req, res) => {
  try {
    res.json(await getAllRocketVariants());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/rocket_variants", async (req, res) => {
  try {
    await insertRocketVariant(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/rocket_variants/:id", async (req, res) => {
  try {
    await updateRocketVariant(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/rocket_variants/:id", async (req, res) => {
  try {
    await deleteRocketVariant(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* 🏭 MANUFACTURERS */
/* -------------------------------------------------------------------------- */
app.get("/api/manufacturers", async (_req, res) => {
  try {
    res.json(await getAllManufacturers());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/manufacturers", async (req, res) => {
  try {
    await insertManufacturer(req.body);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/manufacturers/:id", async (req, res) => {
  try {
    await updateManufacturer(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/manufacturers/:id", async (req, res) => {
  try {
    await deleteManufacturer(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/* ✅ Start Server */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
