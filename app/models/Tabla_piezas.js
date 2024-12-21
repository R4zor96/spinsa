const { getConnection } = require("../config/Conexion.js");

/**
 * Inserta una nueva pieza en la base de datos.
 *
 * @param {string} nombrePieza - El nombre de la pieza.
 * @param {string} descripcionPieza - La descripción de la pieza (opcional).
 * @returns {Promise<number>} - Devuelve el ID de la pieza insertada.
 */
async function insertarPieza(nombrePieza, descripcionPieza = null) {
  try {
    const conn = await getConnection();

    // Consulta para insertar los datos en la tabla pieza
    const query = `
      INSERT INTO pieza (nombre_pieza, descripcion_pieza) 
      VALUES (?, ?)
    `;

    // Ejecutar la consulta con los valores proporcionados
    const result = await conn.query(query, [nombrePieza, descripcionPieza]);

    console.log("Pieza insertada con éxito. ID:", result.insertId);
    return result.insertId; // Devolver el ID de la pieza insertada
  } catch (err) {
    console.error("Error al insertar la pieza:", err);
    throw err; // Lanzar el error para manejarlo en otro lugar si es necesario
  }
}

module.exports = { insertarPieza };
