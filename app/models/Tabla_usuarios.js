const { getConnection } = require("../config/Conexion.js");

/**
 * Obtiene la información de un usuario por su ID.
 *
 * @param {number} idUsuario - ID del usuario.
 * @returns {Promise<Object>} - Información del usuario.
 */
async function obtenerUsuarioPorId(idUsuario) {
  try {
    const conn = await getConnection();
    const query = "SELECT * FROM usuario WHERE id_usuario = ?";
    const [usuario] = await conn.query(query, [idUsuario]);
    return usuario;
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
    const query = `
      UPDATE usuario 
      SET nombre_usuario = ?, ap_usuario = ?, am_usuario = ?, correo_usuario = ?, contrasena_usuario = SHA2(?, 256) 
      WHERE id_usuario = ?`;
    const result = await conn.query(query, [
      datos.nombre_usuario,
      datos.ap_usuario,
      datos.am_usuario,
      datos.correo_usuario,
      datos.contrasena_usuario,
      idUsuario,
    ]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error al actualizar el usuario:", err);
    throw err;
  }
}

module.exports = { obtenerUsuarioPorId, actualizarUsuario };
