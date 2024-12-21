const { getConnection } = require("../config/Conexion.js");

/**
 * Obtiene todas las producciones asignadas a una marca específica.
 *
 * @param {number} idMarca - ID de la marca.
 * @returns {Promise<Array>} - Lista de producciones para la marca.
 */
async function obtenerProduccionesPorMarca(idMarca) {
  try {
    const conn = await getConnection();

    // Consulta para obtener las producciones de una marca específica
    const query = `
      SELECT * 
      FROM produccion 
      WHERE id_marca = ? 
      ORDER BY id_produccion
    `;

    const producciones = await conn.query(query, [idMarca]);

    console.log("Producciones obtenidas para la marca:", producciones);
    return producciones; // Devuelve las producciones obtenidas
  } catch (err) {
    console.error("Error al obtener las producciones:", err);
    throw err;
  }
}

/**
 * Inserta una nueva producción en la base de datos.
 *
 * @param {number} idMarca - ID de la marca asociada.
 * @param {number} idPieza - ID de la pieza asociada.
 * @param {string} folioProduccion - Folio de la producción.
 * @param {number} cantidadProduccion - Cantidad producida.
 * @param {string} estatusProduccion - Estatus de la producción.
 * @param {number} aprobadoProduccion - Si está aprobada (1) o no (0).
 * @param {string} nombreProduccion - Nombre de la producción.
 * @param {string} descripcionProduccion - Descripción de la producción (opcional).
 * @param {string} fsProduccion - Fecha de la producción (opcional).
 * @returns {Promise<number>} - Devuelve el ID de la producción insertada.
 */
async function insertarProduccion(
  idMarca,
  idPieza,
  folioProduccion,
  cantidadProduccion,
  estatusProduccion,
  aprobadoProduccion,
  nombreProduccion,
  descripcionProduccion = null,
  fsProduccion = null
) {
  try {
    const conn = await getConnection();

    const query = `
        INSERT INTO produccion (
            id_marca,
            id_pieza,
            folio_produccion,
            cantidad_produccion,
            estatus_produccion,
            aprobado_produccion,
            nombre_produccion,
            descripcion_produccion,
            FS_produccion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

    const result = await conn.query(query, [
      idMarca,
      idPieza,
      folioProduccion,
      cantidadProduccion,
      estatusProduccion,
      aprobadoProduccion,
      nombreProduccion,
      descripcionProduccion,
      fsProduccion,
    ]);

    console.log("Producción insertada con éxito. ID:", result.insertId);
    return result.insertId; // Devuelve el ID de la producción insertada
  } catch (err) {
    console.error("Error al insertar la producción:", err);
    throw err;
  }
}

/**
 * Elimina una producción de la base de datos por su ID.
 *
 * @param {number} idProduccion - ID de la producción a eliminar.
 * @returns {Promise<void>} - Indica que la eliminación se realizó correctamente.
 */
async function eliminarProduccion(idProduccion) {
  try {
    const conn = await getConnection();

    const query = "DELETE FROM produccion WHERE id_produccion = ?";
    await conn.query(query, [idProduccion]);

    console.log(`Producción con ID ${idProduccion} eliminada con éxito.`);
  } catch (err) {
    console.error("Error al eliminar la producción:", err);
    throw err;
  }
}

module.exports = {
  obtenerProduccionesPorMarca,
  insertarProduccion,
  eliminarProduccion,
};
