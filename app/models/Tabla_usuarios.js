const { getConnection } = require("../config/Conexion.js");

/**
 * Obtiene la información de un usuario por su ID.
 *
 * @param {number} idUsuario - ID del usuario.
 * @returns {Promise<Object|null>} - Información del usuario o `null` si no existe.
 */
async function obtenerUsuarioPorId(idUsuario) {
  try {
    const conn = await getConnection();
    const query = "SELECT * FROM usuario WHERE id_usuario = ?";
    const [result] = await conn.execute(query, [idUsuario]);

    if (result.length > 0) {
      return result[0];
    } else {
      console.warn(`No se encontró ningún usuario con ID ${idUsuario}.`);
      return null;
    }
  } catch (err) {
    console.error("Error al obtener el usuario:", err);
    throw err;
  }
}

/**
 * Actualiza los datos del usuario.
 *
 * @param {number} idUsuario - ID del usuario a actualizar.
 * @param {Object} datos - Datos a actualizar (nombre, ap, am, correo, contrasena).
 * @returns {Promise<boolean>} - `true` si se actualizó correctamente.
 */
async function actualizarUsuario(idUsuario, datos) {
  try {
    const conn = await getConnection();

    let query = "UPDATE usuario SET ";
    const valores = [];

    if (datos.nombre_usuario) {
      query += "nombre_usuario = ?, ";
      valores.push(datos.nombre_usuario);
    }
    if (datos.ap_usuario) {
      query += "ap_usuario = ?, ";
      valores.push(datos.ap_usuario);
    }
    if (datos.am_usuario) {
      query += "am_usuario = ?, ";
      valores.push(datos.am_usuario);
    }
    if (datos.correo_usuario) {
      query += "correo_usuario = ?, ";
      valores.push(datos.correo_usuario);
    }
    if (datos.contrasena_usuario) {
      query += "contrasena_usuario = SHA2(?, 256), ";
      valores.push(datos.contrasena_usuario);
    }

    query = query.slice(0, -2) + " WHERE id_usuario = ?";
    valores.push(idUsuario);

    const [result] = await conn.execute(query, valores);

    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error al actualizar el usuario:", err);
    throw err;
  }
}

module.exports = { obtenerUsuarioPorId, actualizarUsuario };
