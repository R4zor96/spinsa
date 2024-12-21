const mysql = require("promise-mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "spinsa",
});

connection
  .then(() => {
    console.log("Conexion exitosa a la base de datos");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos: ", err);
  });

function getConnection() {
  return connection;
}

module.exports = { getConnection };
