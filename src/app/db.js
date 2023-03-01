const path = require("path");
const fs = require("fs");

const DATA_PATH = "./data.json";
const getData = async () => {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
};

const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");

var database;

const init = async () => {
  [database] = await Promise.all([
    sqlite.open({
      filename: "./data.db",
      driver: sqlite3.Database,
    }),
  ]);

  // setup user table
  await table_users_setup();
  await table_users_clear();

  // setup types table
  await table_types_setup();

  // setup abilities table
  await table_abilities_setup();
  await table_abilities_clear();
};

// USER TABLE FUNCTIONS

const table_users_setup = async () => {
  database.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email EMAIL,
        created_at DATETIME
      ); `
  );
};

const table_users_drop = async () => {
  database.run(`DROP TABLE IF EXISTS users;`);
};

const table_users_clear = async () => {
  database.run(`DELETE FROM users;`);
};

const table_users_insert = async (username, email, created_at = Date.now()) => {
  database.run(
    "INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)",
    [username, email, created_at]
  );
};

const table_users_check = async (username, email) => {
  return (
    (await database.run(
      "SELECT * FROM users WHERE username = ? AND email = ?",
      [username, email]
    )) != undefined
  );
};

const table_users_get = async (username, email) => {
  return await database.run(
    "SELECT * FROM users WHERE username = ? AND email = ?",
    [username, email]
  );
};

const table_users_getAll = async () => {
  return await database.all("SELECT * FROM users");
};

// TYPES TABLE FUNCTIONS

const table_types_setup = async () => {
  Promise.all([
    await database.run("DROP TABLE IF EXISTS types;"),
    await database.run(
      `CREATE TABLE IF NOT EXISTS types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
        );`
    ),
    database.run(`INSERT INTO types(name) VALUES('hacker'),('city');`),
  ]);
};

// ABILTY TABLE FUNCTIONS

const table_abilities_setup = async () => {
  database.run(`
    CREATE TABLE IF NOT EXISTS abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type_id INTEGER,
      description TEXT,
      cost INTEGER,
      FOREIGN KEY(type_id) REFERENCES types(id)
    );
  `);
};

const table_abilities_clear = async () => {
  database.run(`DELETE FROM abilities;`);
};

// GAME TABLE FUNCTIONS

// EVENT ABLE FUNCTIONS

module.exports = {
  getData,
  init,

  table_users_setup,
  table_users_drop,
  table_users_clear,
  table_users_insert,
  table_users_check,
  table_users_get,
  table_users_getAll,

  table_types_setup,

  database,
};
