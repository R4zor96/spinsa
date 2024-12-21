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

/**
 * Obtiene una pieza de la base de datos por su ID.
 *
 * @param {number} idPieza - ID de la pieza a buscar.
 * @returns {Promise<Object|null>} - Devuelve la pieza encontrada o `null` si no existe.
 */
async function obtenerPiezaPorId(idPieza) {
  try {
    const conn = await getConnection();

    const query = "SELECT * FROM pieza WHERE id_pieza = ?";
    const [pieza] = await conn.query(query, [idPieza]);

    if (pieza) {
      console.log("Pieza encontrada:", pieza);
      return pieza; // Devuelve la pieza encontrada
    } else {
      console.warn(`No se encontró ninguna pieza con ID ${idPieza}.`);
      return null; // Si no se encuentra, devuelve null
    }
  } catch (err) {
    console.error("Error al obtener la pieza por ID:", err);
    throw err; // Lanza el error para manejarlo en otro lugar
  }
}

/**
 * Elimina una pieza de la base de datos por su ID.
 *
 * @param {number} idPieza - ID de la pieza a eliminar.
 * @returns {Promise<void>} - Indica que la eliminación se realizó correctamente.
 */
async function eliminarPieza(idPieza) {
  try {
    const conn = await getConnection();

    const query = "DELETE FROM pieza WHERE id_pieza = ?";
    await conn.query(query, [idPieza]);

    console.log(`Pieza con ID ${idPieza} eliminada con éxito.`);
  } catch (err) {
    console.error("Error al eliminar la pieza:", err);
    throw err;
  }
}

/**
 * Actualiza los datos de una pieza en la base de datos.
 *
 * @param {number} idPieza - ID de la pieza a actualizar.
 * @param {string} nombre - Nuevo nombre de la pieza.
 * @param {string} descripcion - Nueva descripción de la pieza.
 * @returns {Promise<void>} - Indica que la actualización se realizó correctamente.
 */
async function actualizarPieza(idPieza, nombre, descripcion) {
  try {
    const conn = await getConnection();

    const query =
      "UPDATE pieza SET nombre_pieza = ?, descripcion_pieza = ? WHERE id_pieza = ?";
    await conn.query(query, [nombre, descripcion, idPieza]);

    console.log(`Pieza con ID ${idPieza} actualizada con éxito.`);
  } catch (err) {
    console.error("Error al actualizar la pieza:", err);
    throw err;
  }
}

module.exports = {
  insertarPieza,
  obtenerPiezas,
  obtenerPiezaPorId,
  eliminarPieza,
  actualizarPieza,
};
