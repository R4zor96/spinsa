const { app, BrowserWindow, ipcMain } = require("electron");
const { getConnection } = require("./app/config/Conexion.js");
const path = require("path");
const fs = require("fs");

const userDataPath = path.join(app.getPath("userData"), "user_data.json");
//const userDataPath = path.join(__dirname, "user_data.json");

console.log("Ruta del archivo JSON:", userDataPath);

let mainWindow;
let currentUser = null; //datos del usuario

// Guardar datos en un archivo JSON
function saveUserData(data) {
  try {
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
    console.log("Datos del usuario guardados correctamente.");
  } catch (err) {
    console.error("Error al guardar los datos del usuario:", err);
  }
}

// Leer datos del archivo JSON
function readUserData() {
  try {
    if (fs.existsSync(userDataPath)) {
      const data = fs.readFileSync(userDataPath);
      return JSON.parse(data);
    }
    return null; // Si el archivo no existe, devuelve null
  } catch (err) {
    console.error("Error al leer los datos del usuario:", err);
    return null;
  }
}

// Función para eliminar el archivo JSON
function clearUserData() {
  try {
    if (fs.existsSync(userDataPath)) {
      fs.unlinkSync(userDataPath);
      console.log("Archivo JSON eliminado correctamente.");
    } else {
      console.warn("El archivo JSON no existe.");
    }
  } catch (err) {
    console.error("Error al eliminar el archivo JSON:", err);
  }
}

//=============================================================================================================
//                                              Manejadores JSON
//=============================================================================================================

// Manejador para leer los datos del JSON
ipcMain.handle("read-user-data", async () => {
  return readUserData();
});

// Manejador para guardar datos en el JSON
ipcMain.handle("save-user-data", async (event, data) => {
  saveUserData(data);
});

// Manejador para eliminar el JSON
ipcMain.handle("clear-user-data", async () => {
  clearUserData();
});

// Manejador para enviar datos al renderer
ipcMain.on("request-user-data", (event) => {
  const userData = readUserData();
  if (userData) {
    event.sender.send("user-data", userData);
  }
});

async function login(correo, password) {
  console.log("Iniciando sesión...");
  try {
    const conn = await getConnection();
    console.log("Conexión a la base de datos exitosa");

    const query =
      "SELECT * FROM usuario WHERE correo_usuario = ? AND contrasena_usuario = SHA2(?, 256)";

    const results = await conn.query(query, [correo, password]);

    if (results.length > 0) {
      console.log("Usuario encontrado:", results[0]);
      currentUser = results[0];

      // Guardar datos en el archivo JSON
      saveUserData(currentUser);

      const [userData] = currentUser;
      const { id_rol } = userData;

      console.log("datos de current user:", currentUser);
      console.log("datos de la variable de id_rol:", id_rol);

      switch (id_rol) {
        case 128:
          mainWindow.loadFile("src/app/ui/pages-admin/dashboard-admin.html");
          break;
        case 64:
          mainWindow.loadFile("src/app/ui/pages-empleados/dashboard.html");
          break;
        default:
          console.log("Rol desconocido, no se pudo redirigir.");
          break;
      }

      // Esperar a que el contenido esté listo antes de enviar los datos
      mainWindow.webContents.once("dom-ready", () => {
        mainWindow.webContents.send("user-data", currentUser);
      });
    } else {
      console.log("Credenciales incorrectas.");
    }
  } catch (err) {
    console.error("Error al conectar o consultar en la base de datos:", err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "app", "backend", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("src/app/ui/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// escucha el evento de login
ipcMain.on("login-attempt", async (event, { correo, password }) => {
  await login(correo, password);
});

//=============================================================================================================
//                                              FUNCIONES PRODUCCIONES
//=============================================================================================================
const {
  obtenerProduccionesPorMarca,
  insertarProduccion,
  eliminarProduccion,
  actualizarProduccion,
  obtenerProduccionPorId,
} = require("./app/models/Tabla_producciones.js");

// Manejador para insertar una nueva producción
ipcMain.handle("insertar-produccion", async (event, produccionData) => {
  try {
    const produccionId = await insertarProduccion(
      produccionData.idMarca,
      produccionData.folioProduccion,
      produccionData.estatusProduccion,
      produccionData.aprobadoProduccion,
      produccionData.nombreProduccion,
      produccionData.descripcionProduccion,
      produccionData.fsProduccion
    );

    // Programar recarga después de 2 segundos
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.webContents.reload(); // Recargar la página actual
      }
    }, 1000); // Esperar 2000 ms (2 segundos)

    return produccionId; // Devuelve el ID de la producción insertada
  } catch (err) {
    console.error("Error al insertar la producción:", err);
    throw err;
  }
});

// Manejador para obtener producciones de una marca
ipcMain.handle("obtener-producciones", async (event, idMarca) => {
  try {
    const producciones = await obtenerProduccionesPorMarca(idMarca);
    return producciones; // Devuelve las producciones al renderer
  } catch (err) {
    console.error("Error al obtener las producciones:", err);
    throw err;
  }
});

// Manejador para obtener todas las producciones
ipcMain.handle("obtener-todas-las-producciones", async () => {
  try {
    const conn = await getConnection(); // Obtén la conexión desde mysql2/promise
    const query = "SELECT * FROM produccion";

    // Ejecuta la consulta y desestructura los resultados
    const [producciones] = await conn.query(query);

    console.log("Producciones obtenidas:", producciones); // Depuración
    return producciones; // Retorna los datos obtenidos
  } catch (err) {
    console.error("Error al obtener todas las producciones:", err);
    throw err; // Lanza el error para manejarlo en el frontend si es necesario
  }
});

ipcMain.handle("obtener-producciones-por-dia-semana", async () => {
  try {
    const conn = await getConnection(); // Obtén la conexión desde mysql2/promise

    // Nueva consulta SQL para obtener las producciones agrupadas por día de la semana
    const query = `
      SELECT 
        DAYOFWEEK(FS_produccion) AS dia_semana, 
        COUNT(*) AS total 
      FROM produccion
      WHERE FS_produccion >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        AND FS_produccion <= CURDATE() + INTERVAL (6 - WEEKDAY(CURDATE())) DAY
      GROUP BY dia_semana
      ORDER BY dia_semana;
    `;

    // Ejecuta la consulta
    const [result] = await conn.query(query);

    // Formatea los datos para que el frontend los entienda
    const produccionesPorDia = Array(7).fill(0); // Inicializa con 7 días (domingo a sábado)
    result.forEach(({ dia_semana, total }) => {
      produccionesPorDia[dia_semana - 1] = total; // Mapear valores
    });

    console.log("datos del array DatosSemana:", produccionesPorDia); // Depuración
    return produccionesPorDia; // Devuelve los resultados
  } catch (err) {
    console.error("Error al obtener producciones por día de la semana:", err);
    throw err; // Propaga el error
  }
});

// Manejador para eliminar una producción
ipcMain.handle("eliminar-produccion", async (event, idProduccion) => {
  try {
    await eliminarProduccion(idProduccion);
    console.log(`Producción con ID ${idProduccion} eliminada.`);
  } catch (err) {
    console.error(
      `Error al eliminar la producción con ID ${idProduccion}:`,
      err
    );
    throw err; // Lanza el error para manejarlo en el renderer
  }
});

// Manejador para redirigir al dashboard de actualización
ipcMain.handle(
  "redirigir-actualizar-produccion",
  async (event, idProduccion) => {
    try {
      // Leer los datos del usuario desde el archivo JSON
      const userData = readUserData();
      if (!userData[0] || !userData[0].id_rol) {
        throw new Error(
          "No se encontró la información del usuario o el id_rol."
        );
      }

      const { id_rol } = userData[0];

      // Redirigir según el id_rol
      if (id_rol === 128) {
        mainWindow.loadFile(
          "src/app/ui/pages-admin/dashboard-actualizar-produccion.html"
        );
      } else {
        mainWindow.loadFile(
          "src/app/ui/pages-empleados/dashboard-actualizar-produccion.html"
        );
      }

      // Cargar los datos de la producción seleccionada
      mainWindow.webContents.once("did-finish-load", async () => {
        const produccion = await obtenerProduccionPorId(idProduccion);
        if (produccion) {
          mainWindow.webContents.send("cargar-produccion", produccion);
        } else {
          mainWindow.webContents.send(
            "cargar-produccion-error",
            `No se encontró la producción con ID ${idProduccion}`
          );
        }
      });
    } catch (err) {
      console.error("Error al redirigir al dashboard de actualización:", err);
    }
  }
);

// Manejador para actualizar una producción
ipcMain.handle(
  "actualizar-produccion",
  async (event, { idProduccion, datos }) => {
    try {
      await actualizarProduccion(idProduccion, datos);
      console.log(`Producción con ID ${idProduccion} actualizada con éxito.`);
      return { success: true, message: "Producción actualizada con éxito." };
    } catch (err) {
      console.error(
        `Error al actualizar la producción con ID ${idProduccion}:`,
        err
      );
      return { success: false, message: "Error al actualizar la producción." };
    }
  }
);

//=============================================================================================================
//                                              FUNCIONES USUARIOS
//=============================================================================================================
const {
  obtenerUsuarioPorId,
  actualizarUsuario,
} = require("./app/models/Tabla_usuarios.js");

// Obtener usuario por ID
ipcMain.handle("obtener-usuario-por-id", async (event, idUsuario) => {
  try {
    return await obtenerUsuarioPorId(idUsuario);
  } catch (err) {
    console.error("Error al obtener el usuario:", err);
    throw err;
  }
});

// Actualizar usuario
ipcMain.handle("actualizar-usuario", async (event, { idUsuario, datos }) => {
  try {
    // Excluir contraseña si no se proporciona
    if (!datos.contrasena_usuario || datos.contrasena_usuario.trim() === "") {
      delete datos.contrasena_usuario;
    }

    const actualizado = await actualizarUsuario(idUsuario, datos);

    if (actualizado) {
      return { success: true, message: "Datos actualizados correctamente." };
    } else {
      return { success: false, message: "No se pudo actualizar el usuario." };
    }
  } catch (err) {
    console.error("Error al actualizar el usuario:", err);
    throw err;
  }
});

//=============================================================================================================
//                                              FUNCIONES INVENTARIOS
//=============================================================================================================
const {
  insertarInventario,
  obtenerInventariosPorMarca,
  eliminarInventario,
  obtenerInventarioPorId,
  actualizarInventario,
  obtenerTodosLosInventarios,
} = require("./app/models/Tabla_inventarios.js");

// Manejador para insertar inventario
ipcMain.handle(
  "insertar-inventario",
  async (
    event,
    { idMarca, nombreInventario, cantidadInventario, fechaUltimoMovimiento }
  ) => {
    try {
      const inventarioId = await insertarInventario(
        idMarca,
        nombreInventario,
        cantidadInventario,
        fechaUltimoMovimiento
      );
      console.log("Inventario registrado con ID:", inventarioId);
      return {
        success: true,
        message: "Inventario registrado con éxito.",
        id: inventarioId,
      };
    } catch (err) {
      console.error("Error al registrar el inventario:", err);
      return { success: false, message: "Error al registrar el inventario." };
    }
  }
);

// Manejador para obtener inventarios por marca
ipcMain.handle("obtener-inventarios", async (event, idMarca) => {
  try {
    const inventarios = await obtenerInventariosPorMarca(idMarca);
    return inventarios; // Devuelve los inventarios al renderer
  } catch (err) {
    console.error("Error al obtener los inventarios:", err);
    throw err;
  }
});

// Manejador para eliminar un inventario
ipcMain.handle("eliminar-inventario", async (event, idInventario) => {
  try {
    await eliminarInventario(idInventario);
    console.log(`Inventario con ID ${idInventario} eliminado correctamente.`);
    return { success: true, message: "Inventario eliminado correctamente." };
  } catch (err) {
    console.error(
      `Error al eliminar el inventario con ID ${idInventario}:`,
      err
    );
    return { success: false, message: "Error al eliminar el inventario." };
  }
});

//redireccionar al dashboard:
ipcMain.handle(
  "redirigir-actualizar-inventario",
  async (event, idInventario) => {
    try {
      // Leer los datos del usuario desde el archivo JSON
      const userData = readUserData();
      if (!userData[0] || !userData[0].id_rol) {
        throw new Error(
          "No se encontró la información del usuario o el id_rol."
        );
      }

      const { id_rol } = userData[0];

      // Redirigir según el rol del usuario
      if (id_rol === 128) {
        mainWindow.loadFile(
          "src/app/ui/pages-admin/dashboard-actualizar-inventario.html"
        );
      } else {
        mainWindow.loadFile(
          "src/app/ui/pages-empleados/dashboard-actualizar-inventario.html"
        );
      }

      // Pasar los datos del inventario al dashboard
      mainWindow.webContents.once("did-finish-load", async () => {
        const inventario = await obtenerInventarioPorId(idInventario);
        if (inventario) {
          mainWindow.webContents.send("cargar-inventario", inventario);
        } else {
          mainWindow.webContents.send(
            "cargar-inventario-error",
            `No se encontró el inventario con ID ${idInventario}`
          );
        }
      });
    } catch (err) {
      console.error("Error al redirigir al dashboard de actualización:", err);
    }
  }
);

//Actualizar inventario:
ipcMain.handle(
  "actualizar-inventario",
  async (event, { idInventario, datos }) => {
    try {
      console.log("Datos recibidos para actualización:", {
        idInventario,
        datos,
      });
      await actualizarInventario(idInventario, datos);

      console.log(`Inventario con ID ${idInventario} actualizado con éxito.`);
      return { success: true, message: "Inventario actualizado con éxito." };
    } catch (err) {
      console.error(
        `Error al actualizar el inventario con ID ${idInventario}:`,
        err
      );
      // Retorna el error capturado para que en el frontend
      // aparezca un mensaje más claro si quieres
      return { success: false, message: err.message };
    }
  }
);

// Manejador para obtener *todos* los inventarios (de todas las marcas)
ipcMain.handle("obtener-todos-los-inventarios", async (event) => {
  try {
    const inventarios = await obtenerTodosLosInventarios();
    return inventarios; // Devolvemos la lista al renderer
  } catch (err) {
    console.error("Error al obtener todos los inventarios:", err);
    throw err;
  }
});

//=============================================================================================================
//                                              Tupu
//=============================================================================================================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

module.exports = {
  createWindow,
  login,
};
