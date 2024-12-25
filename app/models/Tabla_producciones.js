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

    const query = `
      SELECT * 
      FROM produccion 
      WHERE id_marca = ? 
      ORDER BY id_produccion
    `;

    const [producciones] = await conn.execute(query, [idMarca]);

    console.log("Producciones obtenidas para la marca:", producciones);
    return producciones;
  } catch (err) {
    console.error("Error al obtener las producciones:", err);
    throw err;
  }
}

/**
 * Inserta una nueva producción en la base de datos.
 *
 * @param {number} idMarca - ID de la marca asociada.
 * @param {string} folioProduccion - Folio de la producción.
 * @param {string} estatusProduccion - Estatus de la producción.
 * @param {number} aprobadoProduccion - Si está aprobada (1) o no (0).
 * @param {string} nombreProduccion - Nombre de la producción.
 * @param {string} descripcionProduccion - Descripción de la producción (opcional).
 * @param {string} fsProduccion - Fecha de la producción (opcional).
 * @returns {Promise<number>} - Devuelve el ID de la producción insertada.
 */
async function insertarProduccion(
  idMarca,
  folioProduccion,
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
            folio_produccion,
            estatus_produccion,
            aprobado_produccion,
            nombre_produccion,
            descripcion_produccion,
            FS_produccion
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await conn.execute(query, [
      idMarca,
      folioProduccion,
      estatusProduccion,
      aprobadoProduccion,
      nombreProduccion,
      descripcionProduccion,
      fsProduccion,
    ]);

    console.log("Producción insertada con éxito. ID:", result.insertId);
    return result.insertId;
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
    await conn.execute(query, [idProduccion]);

    console.log(`Producción con ID ${idProduccion} eliminada con éxito.`);
  } catch (err) {
    console.error("Error al eliminar la producción:", err);
    throw err;
  }
}

/**
 * Actualiza los datos de una producción en la base de datos.
 *
 * @param {number} idProduccion - ID de la producción a actualizar.
 * @param {Object} datos - Datos de la producción a actualizar.
 * @returns {Promise<void>} - Indica que la actualización se realizó correctamente.
 */
async function actualizarProduccion(idProduccion, datos) {
  try {
    const conn = await getConnection();

    const query = `
      UPDATE produccion
      SET folio_produccion = ?, 
          nombre_produccion = ?, 
          estatus_produccion = ?, 
          aprobado_produccion = ?, 
          descripcion_produccion = ?, 
          FS_produccion = ?
      WHERE id_produccion = ?
    `;

    const valores = [
      datos.folio_produccion,
      datos.nombre_produccion,
      datos.estatus_produccion,
      datos.aprobado_produccion,
      datos.descripcion_produccion,
      datos.FS_produccion,
      idProduccion,
    ];

    await conn.execute(query, valores);

    console.log(`Producción con ID ${idProduccion} actualizada con éxito.`);
  } catch (err) {
    console.error("Error al actualizar la producción:", err);
    throw err;
  }
}

/**
 * Obtiene una producción de la base de datos por su ID.
 *
 * @param {number} idProduccion - ID de la producción a buscar.
 * @returns {Promise<Object|null>} - Devuelve la producción encontrada o `null` si no existe.
 */
async function obtenerProduccionPorId(idProduccion) {
  try {
    const conn = await getConnection();

    const query = "SELECT * FROM produccion WHERE id_produccion = ?";
    const [result] = await conn.execute(query, [idProduccion]);

    if (result.length > 0) {
      console.log("Producción encontrada:", result[0]);
      return result[0];
    } else {
      console.warn(`No se encontró ninguna producción con ID ${idProduccion}.`);
      return null;
    }
  } catch (err) {
    console.error("Error al obtener la producción por ID:", err);
    throw err;
  }
}

module.exports = {
  obtenerProduccionesPorMarca,
  insertarProduccion,
  eliminarProduccion,
  actualizarProduccion,
  obtenerProduccionPorId,
};
