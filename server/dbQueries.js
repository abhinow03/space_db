
/* -------------------------------------------------------------------------- */
/* 🧩 Utility Queries */
/* -------------------------------------------------------------------------- */

// ✅ Get all table names
export async function getAllTables() {
const [rows] = await dbPool.query("SHOW TABLES");
const key = Object.keys(rows[0])[0];
return rows.map((r) => r[key]);
}

// ✅ Generic: Get first 50 rows + count from any table
export async function getTableData(tableName) {
const [rows] = await dbPool.query(`SELECT * FROM \`${tableName}\` LIMIT 50`);
  const [countRows] = await dbPool.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
return { table: tableName, count: countRows[0].count, rows };
}

/* -------------------------------------------------------------------------- */
/* 🚀 MISSIONS */
/* -------------------------------------------------------------------------- */
export async function getAllMissions() {
const [rows] = await dbPool.query(`
    SELECT m.*, a.name AS agency_name
    FROM missions m
    LEFT JOIN agencies a ON a.agency_id = m.agency_id
    ORDER BY m.mission_id 
  `);
return rows;
}

export async function insertMission(data) {
try {
const { name, agency_id, mission_type, start_date, end_date, status, description, budget_usd } = data;
const query = `
      INSERT INTO missions
      (name, agency_id, mission_type, start_date, end_date, status, description, budget_usd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
await dbPool.query(query, [
name,
agency_id || null,
mission_type || null,
start_date || null,
end_date || null,
status || "planned",
description || null,
budget_usd || null
]);
} catch (err) {
throw new Error(`Insert Mission Error: ${err.message}`);
}
}

export async function updateMission(id, data) {
const { name, agency_id, mission_type, start_date, end_date, status, description, budget_usd } = data;
await dbPool.query(
`
    UPDATE missions
    SET name=?, agency_id=?, mission_type=?, start_date=?, end_date=?, status=?, description=?, budget_usd=?
    WHERE mission_id=?
`,
[name, agency_id || null, mission_type || null, start_date || null, end_date || null, status, description || null, budget_usd || null, id]
);
}

export async function deleteMission(id) {
await dbPool.query("DELETE FROM missions WHERE mission_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🏢 AGENCIES */
/* -------------------------------------------------------------------------- */
export async function getAllAgencies() {
  const [rows] = await dbPool.query("SELECT * FROM agencies ORDER BY agency_id ");
  return rows;
}

export async function insertAgency(data) {
  const { name, country, founded_year, website, description } = data;
  await dbPool.query(
    "INSERT INTO agencies (name, country, founded_year, website, description) VALUES (?, ?, ?, ?, ?)",
    [name, country || null, founded_year || null, website || null, description || null]
  );
}

export async function updateAgency(id, data) {
  const { name, country, founded_year, website, description } = data;
  await dbPool.query(
    "UPDATE agencies SET name=?, country=?, founded_year=?, website=?, description=? WHERE agency_id=?",
    [name, country || null, founded_year || null, website || null, description || null, id]
  );
}

export async function deleteAgency(id) {
  await dbPool.query("DELETE FROM agencies WHERE agency_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 👩‍🚀 CREW MEMBERS */
/* -------------------------------------------------------------------------- */
export async function getAllCrewMembers() {
  const [rows] = await dbPool.query(`
    SELECT 
      c.*,
      a.name AS agency_name,
      COUNT(ca.assignment_id) AS missions_count
    FROM crew_members c
    LEFT JOIN agencies a ON a.agency_id = c.agency_id
    LEFT JOIN crew_assignments ca ON ca.crew_member_id = c.crew_id
    GROUP BY c.crew_id
    ORDER BY c.crew_id 
  `);
  return rows;
}

export async function insertCrewMember(data) {
  const { name, nationality, agency_id, role, date_of_birth, bio } = data;
  await dbPool.query(
    "INSERT INTO crew_members (name, nationality, agency_id, role, date_of_birth, bio) VALUES (?, ?, ?, ?, ?, ?)",
    [name, nationality || null, agency_id || null, role || null, date_of_birth || null, bio || null]
  );
}

export async function updateCrewMember(id, data) {
  const { name, nationality, agency_id, role, date_of_birth, bio } = data;
  await dbPool.query(
    "UPDATE crew_members SET name=?, nationality=?, agency_id=?, role=?, date_of_birth=?, bio=? WHERE crew_id=?",
    [name, nationality || null, agency_id || null, role || null, date_of_birth || null, bio || null, id]
  );
}

export async function deleteCrewMember(id) {
  await dbPool.query("DELETE FROM crew_members WHERE crew_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🧑‍🚀 CREW ASSIGNMENTS */
/* -------------------------------------------------------------------------- */
export async function getAllCrewAssignments() {
  const [rows] = await dbPool.query(`
    SELECT 
      ca.*,
      cm.name AS crew_member_name,
      m.name AS mission_name
    FROM crew_assignments ca
    LEFT JOIN crew_members cm ON cm.crew_id = ca.crew_member_id
    LEFT JOIN missions m ON m.mission_id = ca.mission_id
    ORDER BY ca.assignment_id 
  `);
  return rows;
}

export async function insertCrewAssignment(data) {
  const { crew_member_id, mission_id, role, assignment_date } = data;
  await dbPool.query(
    "INSERT INTO crew_assignments (crew_member_id, mission_id, role, assignment_date) VALUES (?, ?, ?, ?);",
    [crew_member_id || null, mission_id || null, role || null, assignment_date || null]
  );
}

export async function updateCrewAssignment(id, data) {
  const { crew_member_id, mission_id, role, assignment_date } = data;
  await dbPool.query(
    "UPDATE crew_assignments SET crew_member_id=?, mission_id=?, role=?, assignment_date=? WHERE assignment_id=?;",
    [crew_member_id || null, mission_id || null, role || null, assignment_date || null, id]
  );
}

export async function deleteCrewAssignment(id) {
  await dbPool.query("DELETE FROM crew_assignments WHERE assignment_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🚀 LAUNCHES */
/* -------------------------------------------------------------------------- */
export async function getAllLaunches() {
const [rows] = await dbPool.query(`
    SELECT l.*, m.name AS mission_name, rv.variant_name
    FROM launches l
    LEFT JOIN missions m ON m.mission_id = l.mission_id
    LEFT JOIN rocket_variants rv ON rv.variant_id = l.variant_id
    ORDER BY l.launch_id 
  `);
return rows;
}

export async function insertLaunch(data) {
const { mission_id, variant_id, h_name, launch_date, launch_site, outcome } = data;
await dbPool.query(
"INSERT INTO launches (mission_id, variant_id, h_name, launch_date, launch_site, outcome) VALUES (?, ?, ?, ?, ?, ?);",
[mission_id || null, variant_id || null, h_name || null, launch_date || null, launch_site || null, outcome || "success"]
);
}

export async function updateLaunch(id, data) {
const { mission_id, variant_id, h_name, launch_date, launch_site, outcome } = data;
await dbPool.query(
"UPDATE launches SET mission_id=?, variant_id=?, h_name=?, launch_date=?, launch_site=?, outcome=? WHERE launch_id=?;",
[mission_id || null, variant_id || null, h_name || null, launch_date || null, launch_site || null, outcome, id]
);
}

export async function deleteLaunch(id) {
await dbPool.query("DELETE FROM launches WHERE launch_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🛰️ PAYLOADS */
/* -------------------------------------------------------------------------- */
export async function getAllPayloads() {
  const [rows] = await dbPool.query(`
    SELECT p.*, l.h_name AS launch_name
    FROM payloads p
    LEFT JOIN launches l ON l.launch_id = p.launch_id
    ORDER BY p.payload_id ;
  `);
  return rows;
}

export async function insertPayload(data) {
  const { launch_id, name, type, mass_kg, description } = data;
  await dbPool.query(
    "INSERT INTO payloads (launch_id, name, type, mass_kg, description) VALUES (?, ?, ?, ?, ?);",
    [launch_id || null, name, type || "satellite", mass_kg || null, description || null]
  );
}

export async function updatePayload(id, data) {
  const { launch_id, name, type, mass_kg, description } = data;
  await dbPool.query(
    "UPDATE payloads SET launch_id=?, name=?, type=?, mass_kg=?, description=? WHERE payload_id=?;",
    [launch_id || null, name, type || "satellite", mass_kg || null, description || null, id]
  );
}

export async function deletePayload(id) {
  await dbPool.query("DELETE FROM payloads WHERE payload_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🚀 ROCKETS */
/* -------------------------------------------------------------------------- */
export async function getAllRockets() {
  const [rows] = await dbPool.query(`
    SELECT r.*, m.name AS manufacturer_name
    FROM rockets r
    LEFT JOIN manufacturers m ON m.manufacturer_id = r.manufacturer_id
    ORDER BY r.rocket_id ;
  `);
  return rows;
}

export async function insertRocket(data) {
  const { name, manufacturer_id, first_flight, description, height_meters, mass_kg } = data;
  await dbPool.query(
    "INSERT INTO rockets (name, manufacturer_id, first_flight, description, height_meters, mass_kg) VALUES (?, ?, ?, ?, ?, ?);",
    [name, manufacturer_id || null, first_flight || null, description || null, height_meters || null, mass_kg || null]
  );
}

export async function updateRocket(id, data) {
  const { name, manufacturer_id, first_flight, description, height_meters, mass_kg } = data;
  await dbPool.query(
    "UPDATE rockets SET name=?, manufacturer_id=?, first_flight=?, description=?, height_meters=?, mass_kg=? WHERE rocket_id=?;",
    [name, manufacturer_id || null, first_flight || null, description || null, height_meters || null, mass_kg || null, id]
  );
}

export async function deleteRocket(id) {
  await dbPool.query("DELETE FROM rockets WHERE rocket_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🧱 ROCKET VARIANTS */
/* -------------------------------------------------------------------------- */
export async function getAllRocketVariants() {
const [rows] = await dbPool.query(`     SELECT rv.*, r.name AS rocket_name
    FROM rocket_variants rv
    LEFT JOIN rockets r ON r.rocket_id = rv.rocket_id
    ORDER BY rv.variant_id ;
  `);
return rows;
}

export async function insertRocketVariant(data) {
const { rocket_id, variant_name, max_payload_kg } = data;
await dbPool.query(
"INSERT INTO rocket_variants (rocket_id, variant_name, max_payload_kg) VALUES (?, ?, ?);",
[rocket_id || null, variant_name, max_payload_kg || null]
);
}

export async function updateRocketVariant(id, data) {
const { rocket_id, variant_name, max_payload_kg } = data;
await dbPool.query(
"UPDATE rocket_variants SET rocket_id=?, variant_name=?, max_payload_kg=? WHERE variant_id=?;",
[rocket_id || null, variant_name, max_payload_kg || null, id]
);
}

export async function deleteRocketVariant(id) {
await dbPool.query("DELETE FROM rocket_variants WHERE variant_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🏭 MANUFACTURERS */
/* -------------------------------------------------------------------------- */
export async function getAllManufacturers() {
const [rows] = await dbPool.query("SELECT * FROM manufacturers ORDER BY manufacturer_id ;");
return rows;
}

export async function insertManufacturer(data) {
const { name, country, founded_year, specialization } = data;
await dbPool.query(
  "INSERT INTO manufacturers (name, country, founded_year, specialization) VALUES (?, ?, ?, ?);", 
  [name, country || null, founded_year || null, specialization || null]
);
}

export async function updateManufacturer(id, data) {
const { name, country, founded_year, specialization } = data;
await dbPool.query(
  "UPDATE manufacturers SET name=?, country=?, founded_year=?, specialization=? WHERE manufacturer_id=?;", 
  [name, country || null, founded_year || null, specialization || null, id]
);
}

export async function deleteManufacturer(id) {
await dbPool.query("DELETE FROM manufacturers WHERE manufacturer_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🌐 GRAPH DATA */
/* -------------------------------------------------------------------------- */
import { pool as dbPool } from './db.js';

/**
 * Build graph data from DB:
 * nodes: { id: string, label: string, type: string }
 * links: { source: string, target: string }
 */
export async function getGraphData() {
  const [agencies] = await dbPool.query('SELECT agency_id, name FROM agencies');
  const [missions] = await dbPool.query('SELECT mission_id, name, agency_id FROM missions');
  const [variants] = await dbPool.query('SELECT variant_id, variant_name, rocket_id FROM rocket_variants');
  const [rockets] = await dbPool.query('SELECT rocket_id, name FROM rockets');
  const [launches] = await dbPool.query('SELECT launch_id, mission_id, variant_id, h_name FROM launches');
  const [payloads] = await dbPool.query('SELECT payload_id, name, launch_id FROM payloads');

  const nodes = [];
  const links = [];

  (agencies || []).forEach((a) => nodes.push({ id: `agency:${a.agency_id}`, label: a.name, type: 'agency' }));
  (missions || []).forEach((m) => nodes.push({ id: `mission:${m.mission_id}`, label: m.name, type: 'mission' }));
  (rockets || []).forEach((r) => nodes.push({ id: `rocket:${r.rocket_id}`, label: r.name, type: 'rocket' }));
  (variants || []).forEach((v) =>
    nodes.push({ id: `variant:${v.variant_id}`, label: v.variant_name, type: 'variant' })
  );
  (launches || []).forEach((l) =>
    nodes.push({ id: `launch:${l.launch_id}`, label: l.h_name || `Launch ${l.launch_id}`, type: 'launch' })
  );
  (payloads || []).forEach((p) =>
    nodes.push({ id: `payload:${p.payload_id}`, label: p.name, type: 'payload' })
  );

  (missions || []).forEach((m) => {
    if (m.agency_id) links.push({ source: `agency:${m.agency_id}`, target: `mission:${m.mission_id}` });
  });
  (launches || []).forEach((l) => {
    if (l.mission_id) links.push({ source: `mission:${l.mission_id}`, target: `launch:${l.launch_id}` });
    if (l.variant_id) links.push({ source: `variant:${l.variant_id}`, target: `launch:${l.launch_id}` });
  });
  (variants || []).forEach((v) => {
    if (v.rocket_id) links.push({ source: `rocket:${v.rocket_id}`, target: `variant:${v.variant_id}` });
  });
  (payloads || []).forEach((p) => {
    if (p.launch_id) links.push({ source: `launch:${p.launch_id}`, target: `payload:${p.payload_id}` });
  });

  return { nodes, links };
}
