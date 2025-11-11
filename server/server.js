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
  // optionally other helpers...
} from "./dbQueries.js";
import { getGraphData } from "./dbQueries.js";

// import pool from centralized db.js but avoid name collision by aliasing
import { pool as dbPool } from './db.js';

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
/* 🚀 MISSIONS                                                              */
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
/* 🏢 AGENCIES                                                               */
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
/* 👩‍🚀 CREW MEMBERS                                                          */
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
/* 🧑‍🚀 CREW ASSIGNMENTS                                                      */
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
/* 🚀 LAUNCHES                                                               */
/* -------------------------------------------------------------------------- */
app.get("/api/launches", async (_req, res) => {
  try {
    const data = await getAllLaunches();
    res.json(data);
  } catch (err) {
    console.error('GET /api/launches error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/launches", async (req, res) => {
  console.log('POST /api/launches body:', req.body);
  try {
    await insertLaunch(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/launches error:', err);
    res.status(500).json({ error: err.message });
  }
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
/* 🛰️ PAYLOADS                                                               */
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
/* 🚀 ROCKETS                                                                */
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
/* 🧱 ROCKET VARIANTS                                                         */
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
/* 🏭 MANUFACTURERS                                                           */
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
/* 🔁 Stored procedures / functions (direct endpoints)                        */
/* -------------------------------------------------------------------------- */

/* Call stored procedure add_mission(p_name, p_agency_id, p_status) */
app.post('/api/missions/proc', async (req, res) => {
  console.log('POST /api/missions/proc body:', req.body);
  const body = req.body || {};
  const { name, agency_id, status } = body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  try {
    await dbPool.query('CALL add_mission(?, ?, ?)', [name, agency_id || null, status || null]);
    res.status(201).json({ success: true, message: 'Mission created via procedure' });
  } catch (err) {
    console.error('add_mission error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/missions/:id/complete', async (req, res) => {
  try {
    const { end_date } = req.body;
    await dbPool.query('CALL complete_mission(?, ?)', [req.params.id, end_date || null]);
    res.json({ success: true, message: 'Mission completed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/crew_assignments/proc', async (req, res) => {
  try {
    const { mission_id, crew_member_id, role, assignment_date } = req.body;
    await dbPool.query('CALL assign_crew_to_mission(?, ?, ?, ?)', [
      mission_id,
      crew_member_id,
      role || null,
      assignment_date || null
    ]);
    res.status(201).json({ success: true, message: 'Crew assigned via procedure' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Call stored procedure add_launch(p_mission_id, p_variant_id, p_h_name, p_launch_date, p_launch_site, p_outcome) */
app.post('/api/launches/proc', async (req, res) => {
  console.log('POST /api/launches/proc body:', req.body);
  const body = req.body || {};
  const { mission_id, variant_id, h_name, launch_date, launch_site, outcome } = body;

  if (!mission_id || !variant_id) {
    return res.status(400).json({ error: 'mission_id and variant_id are required' });
  }

  try {
    await dbPool.query('CALL add_launch(?, ?, ?, ?, ?, ?)', [
      mission_id,
      variant_id,
      h_name || null,
      launch_date || null,
      launch_site || null,
      outcome || null,
    ]);
    res.status(201).json({ success: true, message: 'Launch created via procedure' });
  } catch (err) {
    console.error('add_launch error:', err);
    res.status(400).json({ error: err.message });
  }
});

/* Get active mission count via function get_active_mission_count() */
app.get('/api/stats/active-missions', async (_req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT get_active_mission_count() AS count');
    res.json({ count: rows[0]?.count ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get total payload mass for a launch via function get_total_payload_mass(p_launch_id) */
app.get('/api/launches/:id/total-mass', async (req, res) => {
  const launchId = Number(req.params.id);
  if (!Number.isInteger(launchId)) return res.status(400).json({ error: 'Invalid launch id' });
  try {
    const [rows] = await dbPool.query('SELECT get_total_payload_mass(?) AS total_mass', [launchId]);
    res.json({ total_mass: rows[0]?.total_mass ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Start Server                                                            */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

// Graph endpoint: returns { nodes, links } built from DB
app.get('/api/graph', async (_req, res) => {
  try {
    const data = await getGraphData();
    res.json(data);
  } catch (err) {
    console.error('GET /api/graph error:', err);
    res.status(500).json({ error: err.message });
  }
});
