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
/**
 * Obtiene todos los registros de la tabla `pieza`, ordenados por `id_pieza`.
 *
 * @returns {Promise<Array>} - Lista de registros de la tabla `pieza`.
 */
async function obtenerPiezas() {
  try {
    const conn = await getConnection();

    // Consulta para obtener los registros
    const query = `SELECT * FROM pieza ORDER BY id_pieza`;

    // Ejecutar la consulta
    const piezas = await conn.query(query);

    console.log("Registros obtenidos de la tabla pieza:", piezas);
    return piezas; // Devuelve los registros obtenidos
  } catch (err) {
    console.error("Error al obtener los registros de la tabla pieza:", err);
    throw err;
  }
}

module.exports = { insertarPieza, obtenerPiezas };
