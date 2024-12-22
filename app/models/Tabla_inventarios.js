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
    const [result] = await conn.execute(query, [
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

/**
 * Obtiene los inventarios relacionados con una marca específica.
 *
 * @param {number} idMarca - ID de la marca para filtrar los inventarios.
 * @returns {Promise<Array>} - Lista de inventarios para la marca.
 */
async function obtenerInventariosPorMarca(idMarca) {
  try {
    const conn = await getConnection();
    const query = `
      SELECT * FROM inventario
      WHERE id_marca = ?
      ORDER BY id_inventario ASC
    `;
    const [inventarios] = await conn.execute(query, [idMarca]);
    return inventarios;
  } catch (err) {
    console.error("Error al obtener los inventarios por marca:", err);
    throw err;
  }
}

/**
 * Elimina un inventario de la base de datos por su ID.
 *
 * @param {number} idInventario - ID del inventario a eliminar.
 * @returns {Promise<void>} - Indica que la eliminación se realizó correctamente.
 */
async function eliminarInventario(idInventario) {
  try {
    const conn = await getConnection();
    const query = "DELETE FROM inventario WHERE id_inventario = ?";
    await conn.execute(query, [idInventario]);
    console.log(`Inventario con ID ${idInventario} eliminado con éxito.`);
  } catch (err) {
    console.error("Error al eliminar el inventario:", err);
    throw err;
  }
}

/**
 * Obtiene un inventario por su ID.
 *
 * @param {number} idInventario - ID del inventario a buscar.
 * @returns {Promise<Object|null>} - Detalles del inventario o null si no existe.
 */
async function obtenerInventarioPorId(idInventario) {
  try {
    const conn = await getConnection();
    const query = "SELECT * FROM inventario WHERE id_inventario = ?";
    const [inventario] = await conn.execute(query, [idInventario]);
    return inventario[0] || null;
  } catch (err) {
    console.error("Error al obtener el inventario por ID:", err);
    throw err;
  }
}

/**
 * Actualiza un inventario en la base de datos.
 *
 * @param {number} idInventario - ID del inventario a actualizar.
 * @param {Object} datos - Datos a actualizar.
 * @returns {Promise<void>} - Indica que la actualización se realizó correctamente.
 */
async function actualizarInventario(idInventario, datos) {
  try {
    const conn = await getConnection();

    const [existe] = await conn.execute(
      "SELECT COUNT(*) AS total FROM inventario WHERE id_inventario = ?",
      [idInventario]
    );

    if (!existe[0].total) {
      console.warn(`No se encontró ningún inventario con ID ${idInventario}`);
      throw new Error(`No existe un inventario con el ID ${idInventario}.`);
    }

    const query = `
      UPDATE inventario
      SET cantidad_inventario = ?, fecha_ultimo_movimiento = ?
      WHERE id_inventario = ?
    `;
    await conn.execute(query, [
      datos.cantidad_inventario,
      datos.fecha_ultimo_movimiento,
      idInventario,
    ]);

    console.log(`Inventario con ID ${idInventario} actualizado correctamente.`);
  } catch (err) {
    console.error("Error al actualizar el inventario:", err);
    throw err;
  }
}

/**
 * Obtiene todos los inventarios existentes, incluyendo
 * la marca y la pieza asociada.
 * @returns {Promise<Array>} - Lista completa de inventarios.
 */
async function obtenerTodosLosInventarios() {
  try {
    const conn = await getConnection();
    const query = `
      SELECT i.*, m.nombre_marca, p.nombre_pieza
      FROM inventario i
      JOIN marca m ON i.id_marca = m.id_marca
      JOIN pieza p ON i.id_pieza = p.id_pieza
      ORDER BY i.id_inventario ASC
    `;
    const [inventarios] = await conn.execute(query);
    return inventarios;
  } catch (err) {
    console.error("Error al obtener todos los inventarios:", err);
    throw err;
  }
}

module.exports = {
  insertarInventario,
  obtenerInventariosPorMarca,
  eliminarInventario,
  obtenerInventarioPorId,
  actualizarInventario,
  obtenerTodosLosInventarios,
};
