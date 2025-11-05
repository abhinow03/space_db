import { pool } from "./db.js";

/* -------------------------------------------------------------------------- */
/* 🧩 Utility Queries */
/* -------------------------------------------------------------------------- */

// ✅ Get all table names
export async function getAllTables() {
const [rows] = await pool.query("SHOW TABLES");
const key = Object.keys(rows[0])[0];
return rows.map((r) => r[key]);
}

// ✅ Generic: Get first 50 rows + count from any table
export async function getTableData(tableName) {
const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 50`);
  const [countRows] = await pool.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
return { table: tableName, count: countRows[0].count, rows };
}

/* -------------------------------------------------------------------------- */
/* 🚀 MISSIONS */
/* -------------------------------------------------------------------------- */
export async function getAllMissions() {
const [rows] = await pool.query(`
    SELECT m.*, a.name AS agency_name
    FROM missions m
    LEFT JOIN agencies a ON a.agency_id = m.agency_id
    ORDER BY m.mission_id DESC
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
await pool.query(query, [
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
await pool.query(
`
    UPDATE missions
    SET name=?, agency_id=?, mission_type=?, start_date=?, end_date=?, status=?, description=?, budget_usd=?
    WHERE mission_id=?
`,
[name, agency_id || null, mission_type || null, start_date || null, end_date || null, status, description || null, budget_usd || null, id]
);
}

export async function deleteMission(id) {
await pool.query("DELETE FROM missions WHERE mission_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🏢 AGENCIES */
/* -------------------------------------------------------------------------- */
export async function getAllAgencies() {
const [rows] = await pool.query("SELECT * FROM agencies ORDER BY agency_id DESC");
return rows;
}

export async function insertAgency(data) {
const { name, country } = data;
await pool.query("INSERT INTO agencies (name, country) VALUES (?, ?)", [name, country || null]);
}

export async function updateAgency(id, data) {
const { name, country } = data;
await pool.query("UPDATE agencies SET name=?, country=? WHERE agency_id=?", [name, country || null, id]);
}

export async function deleteAgency(id) {
await pool.query("DELETE FROM agencies WHERE agency_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 👩‍🚀 CREW MEMBERS */
/* -------------------------------------------------------------------------- */
export async function getAllCrewMembers() {
const [rows] = await pool.query(`
    SELECT c.*, a.name AS agency_name
    FROM crew_members c
    LEFT JOIN agencies a ON a.agency_id = c.agency_id
    ORDER BY c.crew_id DESC
  `);
return rows;
}

export async function insertCrewMember(data) {
const { name, nationality, agency_id, role } = data;
await pool.query(
"INSERT INTO crew_members (name, nationality, agency_id, role) VALUES (?, ?, ?, ?)",
[name, nationality || null, agency_id || null, role || null]
);
}

export async function updateCrewMember(id, data) {
const { name, nationality, agency_id, role } = data;
await pool.query(
"UPDATE crew_members SET name=?, nationality=?, agency_id=?, role=? WHERE crew_id=?",
[name, nationality || null, agency_id || null, role || null, id]
);
}

export async function deleteCrewMember(id) {
await pool.query("DELETE FROM crew_members WHERE crew_id=?", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🧑‍🚀 CREW ASSIGNMENTS */
/* -------------------------------------------------------------------------- */
export async function getAllCrewAssignments() {
const [rows] = await pool.query(`
    SELECT ca.*, cm.name AS crew_name, l.h_name AS launch_name
    FROM crew_assignments ca
    LEFT JOIN crew_members cm ON cm.crew_id = ca.crew_id
    LEFT JOIN launches l ON l.launch_id = ca.launch_id
    ORDER BY ca.assignment_id DESC
  `);
return rows;
}

export async function insertCrewAssignment(data) {
const { launch_id, crew_id, role } = data;
await pool.query(
"INSERT INTO crew_assignments (launch_id, crew_id, role) VALUES (?, ?, ?);",
[launch_id || null, crew_id || null, role || null]
);
}

export async function updateCrewAssignment(id, data) {
const { launch_id, crew_id, role } = data;
await pool.query(
"UPDATE crew_assignments SET launch_id=?, crew_id=?, role=? WHERE assignment_id=?;",
[launch_id || null, crew_id || null, role || null, id]
);
}

export async function deleteCrewAssignment(id) {
await pool.query("DELETE FROM crew_assignments WHERE assignment_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🚀 LAUNCHES */
/* -------------------------------------------------------------------------- */
export async function getAllLaunches() {
const [rows] = await pool.query(`
    SELECT l.*, m.name AS mission_name, rv.variant_name
    FROM launches l
    LEFT JOIN missions m ON m.mission_id = l.mission_id
    LEFT JOIN rocket_variants rv ON rv.variant_id = l.rocket_variant_id
    ORDER BY l.launch_id DESC
  `);
return rows;
}

export async function insertLaunch(data) {
const { mission_id, variant_id, h_name, launch_date, launch_site, outcome } = data;
await pool.query(
"INSERT INTO launches (mission_id, variant_id, h_name, launch_date, launch_site, outcome) VALUES (?, ?, ?, ?, ?, ?);",
[mission_id || null, variant_id || null, h_name || null, launch_date || null, launch_site || null, outcome || "success"]
);
}

export async function updateLaunch(id, data) {
const { mission_id, variant_id, h_name, launch_date, launch_site, outcome } = data;
await pool.query(
"UPDATE launches SET mission_id=?, variant_id=?, h_name=?, launch_date=?, launch_site=?, outcome=? WHERE launch_id=?;",
[mission_id || null, variant_id || null, h_name || null, launch_date || null, launch_site || null, outcome, id]
);
}

export async function deleteLaunch(id) {
await pool.query("DELETE FROM launches WHERE launch_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🛰️ PAYLOADS */
/* -------------------------------------------------------------------------- */
export async function getAllPayloads() {
const [rows] = await pool.query(`     SELECT p.*, l.h_name AS launch_name
    FROM payloads p
    LEFT JOIN launches l ON l.launch_id = p.launch_id
    ORDER BY p.payload_id DESC;
  `);
return rows;
}

export async function insertPayload(data) {
const { launch_id, name, type, mass_kg } = data;
await pool.query(
"INSERT INTO payloads (launch_id, name, type, mass_kg) VALUES (?, ?, ?, ?);",
[launch_id || null, name, type || "satellite", mass_kg || null]
);
}

export async function updatePayload(id, data) {
const { launch_id, name, type, mass_kg } = data;
await pool.query(
"UPDATE payloads SET launch_id=?, name=?, type=?, mass_kg=? WHERE payload_id=?;",
[launch_id || null, name, type || "satellite", mass_kg || null, id]
);
}

export async function deletePayload(id) {
await pool.query("DELETE FROM payloads WHERE payload_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🚀 ROCKETS */
/* -------------------------------------------------------------------------- */
export async function getAllRockets() {
const [rows] = await pool.query(`     SELECT r.*, m.name AS manufacturer_name
    FROM rockets r
    LEFT JOIN manufacturers m ON m.manufacturer_id = r.manufacturer_id
    ORDER BY r.rocket_id DESC;
  `);
return rows;
}

export async function insertRocket(data) {
const { name, manufacturer_id, first_flight } = data;
await pool.query(
"INSERT INTO rockets (name, manufacturer_id, first_flight) VALUES (?, ?, ?);",
[name, manufacturer_id || null, first_flight || null]
);
}

export async function updateRocket(id, data) {
const { name, manufacturer_id, first_flight } = data;
await pool.query(
"UPDATE rockets SET name=?, manufacturer_id=?, first_flight=? WHERE rocket_id=?;",
[name, manufacturer_id || null, first_flight || null, id]
);
}

export async function deleteRocket(id) {
await pool.query("DELETE FROM rockets WHERE rocket_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🧱 ROCKET VARIANTS */
/* -------------------------------------------------------------------------- */
export async function getAllRocketVariants() {
const [rows] = await pool.query(`     SELECT rv.*, r.name AS rocket_name
    FROM rocket_variants rv
    LEFT JOIN rockets r ON r.rocket_id = rv.rocket_id
    ORDER BY rv.variant_id DESC;
  `);
return rows;
}

export async function insertRocketVariant(data) {
const { rocket_id, variant_name, max_payload_kg } = data;
await pool.query(
"INSERT INTO rocket_variants (rocket_id, variant_name, max_payload_kg) VALUES (?, ?, ?);",
[rocket_id || null, variant_name, max_payload_kg || null]
);
}

export async function updateRocketVariant(id, data) {
const { rocket_id, variant_name, max_payload_kg } = data;
await pool.query(
"UPDATE rocket_variants SET rocket_id=?, variant_name=?, max_payload_kg=? WHERE variant_id=?;",
[rocket_id || null, variant_name, max_payload_kg || null, id]
);
}

export async function deleteRocketVariant(id) {
await pool.query("DELETE FROM rocket_variants WHERE variant_id=?;", [id]);
}

/* -------------------------------------------------------------------------- */
/* 🏭 MANUFACTURERS */
/* -------------------------------------------------------------------------- */
export async function getAllManufacturers() {
const [rows] = await pool.query("SELECT * FROM manufacturers ORDER BY manufacturer_id DESC;");
return rows;
}

export async function insertManufacturer(data) {
const { name, country } = data;
await pool.query("INSERT INTO manufacturers (name, country) VALUES (?, ?);", [name, country || null]);
}

export async function updateManufacturer(id, data) {
const { name, country } = data;
await pool.query("UPDATE manufacturers SET name=?, country=? WHERE manufacturer_id=?;", [name, country || null, id]);
}

export async function deleteManufacturer(id) {
await pool.query("DELETE FROM manufacturers WHERE manufacturer_id=?;", [id]);
}
