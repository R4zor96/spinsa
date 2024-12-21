const { getConnection } = require("../config/Conexion.js");

/**
 * Inserta un nuevo registro de inventario.
 *
 * @param {number} idMarca - ID de la marca.
 * @param {number} idPieza - ID de la pieza.
 * @param {number} cantidadInventario - Cantidad del inventario.
 * @param {string} fechaUltimoMovimiento - Fecha del último movimiento.
 * @returns {Promise<number>} - ID del inventario recién creado.
 */
async function insertarInventario(
  idMarca,
  idPieza,
  cantidadInventario,
  fechaUltimoMovimiento
) {
  try {
    const conn = await getConnection();
    const query = `
      INSERT INTO inventario (id_marca, id_pieza, cantidad_inventario, fecha_ultimo_movimiento) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await conn.query(query, [
      idMarca,
      idPieza,
      cantidadInventario,
      fechaUltimoMovimiento,
    ]);
    return result.insertId;
  } catch (err) {
    console.error("Error al insertar el inventario:", err);
    throw err;
  }
}

module.exports = {
  insertarInventario,
};
