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
    const inventarios = await conn.query(query, [idMarca]);
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
    await conn.query(query, [idInventario]);
    console.log(`Inventario con ID ${idInventario} eliminado con éxito.`);
  } catch (err) {
    console.error("Error al eliminar el inventario:", err);
    throw err;
  }
}

//Obtener inventario por ID
async function obtenerInventarioPorId(idInventario) {
  try {
    const conn = await getConnection();
    const query = "SELECT * FROM inventario WHERE id_inventario = ?";
    const [inventario] = await conn.query(query, [idInventario]);
    return inventario || null;
  } catch (err) {
    console.error("Error al obtener el inventario por ID:", err);
    throw err;
  }
}

// Actualizar inventario
async function actualizarInventario(idInventario, datos) {
  try {
    console.log("Datos para actualizar en la base de datos:", datos);

    const conn = await getConnection();

    // 1. Verificar si existe ese inventario.
    //    Esto evita el problema de affectedRows = 0 cuando en realidad no se encontró nada.
    const [existe] = await conn.query(
      "SELECT COUNT(*) AS total FROM inventario WHERE id_inventario = ?",
      [idInventario]
    );

    if (!existe || !existe.total) {
      console.warn(`No se encontró ningún inventario con ID ${idInventario}`);
      // Lanzamos un error para que lo capture el bloque catch en main.js
      throw new Error(`No existe un inventario con el ID ${idInventario}.`);
    }

    // 2. Realizar el UPDATE, aunque los datos sean los mismos.
    const query = `
      UPDATE inventario
      SET cantidad_inventario = ?, fecha_ultimo_movimiento = ?
      WHERE id_inventario = ?
    `;
    const result = await conn.query(query, [
      datos.cantidad_inventario,
      datos.fecha_ultimo_movimiento,
      idInventario,
    ]);

    console.log("Resultado de la consulta SQL:", result);

    // 3. Como el inventario sí existía, consideramos la operación exitosa:
    console.log(`Inventario con ID ${idInventario} actualizado correctamente.`);

    // (Ya no lanzamos error si affectedRows = 0, pues puede ser que la info sea igual)
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
    const inventarios = await conn.query(query);
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
