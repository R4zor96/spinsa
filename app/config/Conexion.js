//const mysql = require("promise-mysql");
const mysql = require("mysql2/promise");

const connection = mysql.createConnection({
  host: "junction.proxy.rlwy.net",
  user: "root",
  password: "GxgyUgLUokvFwsjObvIQBCOXpGNFuSPj",
  database: "spinsa",
  port: 20605,
});

connection
  .then(() => {
    console.log("Conexión exitosa a la base de datos remota");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos remota: ", err);
  });

function getConnection() {
  return connection;
}

module.exports = { getConnection };
