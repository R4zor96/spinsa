const { app, BrowserWindow, ipcMain } = require("electron");
const { getConnection } = require("./app/config/Conexion.js");
const path = require("path");
const fs = require("fs");

const userDataPath = path.join(app.getPath("userData"), "user_data.json");
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

function sendUserData() {
  const userData = readUserData();
  if (userData && mainWindow) {
    mainWindow.webContents.send("user-data", userData);
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

      const { id_rol } = currentUser;
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
//                                              FUNCIONES JSON
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
//=============================================================================================================
//                                              FUNCIONES PIEZAS
//=============================================================================================================
const {
  insertarPieza,
  obtenerPiezas,
  obtenerPiezaPorId,
  eliminarPieza,
  actualizarPieza,
} = require("./app/models/Tabla_piezas.js");

// Manejador para insertar pieza
ipcMain.handle(
  "insertar-pieza",
  async (event, { nombrePieza, descripcionPieza }) => {
    try {
      const piezaId = await insertarPieza(nombrePieza, descripcionPieza);

      // Programar recarga después de 2 segundos
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.webContents.reload(); // Recargar la página actual
        }
      }, 1350); // Esperar 2000 ms (2 segundos)

      return piezaId; // Devuelve el ID de la pieza inmediatamente
    } catch (err) {
      console.error("Error al insertar la pieza:", err);
      throw err; // Lanza el error para manejarlo en el renderer
    }
  }
);

// Manejador para obtener los registros de piezas
ipcMain.handle("obtener-piezas", async () => {
  try {
    const piezas = await obtenerPiezas();
    return piezas; // Devuelve los registros al renderer
  } catch (err) {
    console.error("Error al obtener los registros de piezas:", err);
    throw err; // Lanza el error para manejarlo en el renderer
  }
});

// Manejador para obtener una pieza por su ID
ipcMain.handle("obtener-pieza-por-id", async (event, idPieza) => {
  try {
    const pieza = await obtenerPiezaPorId(idPieza);
    return pieza;
  } catch (err) {
    console.error(`Error al obtener la pieza con ID ${idPieza}:`, err);
    throw err;
  }
});

// Manejador para eliminar una pieza
ipcMain.handle("eliminar-pieza", async (event, idPieza) => {
  try {
    await eliminarPieza(idPieza);
    console.log(`Pieza con ID ${idPieza} eliminada.`);
  } catch (err) {
    console.error(`Error al eliminar la pieza con ID ${idPieza}:`, err);
    throw err; // Lanza el error para manejarlo en el renderer
  }
});

// Manejador para redirigir al dashboard de actualización
ipcMain.handle("redirigir-actualizar-pieza", async (event, idPieza) => {
  try {
    // Cargar el archivo HTML del dashboard de actualización
    mainWindow.loadFile(
      "src/app/ui/pages-empleados/dashboard-actualizar-pieza.html"
    );

    // Pasar el ID de la pieza seleccionada al dashboard
    mainWindow.webContents.once("did-finish-load", async () => {
      const pieza = await obtenerPiezaPorId(idPieza);
      if (pieza) {
        mainWindow.webContents.send("cargar-pieza", pieza);
      } else {
        mainWindow.webContents.send(
          "cargar-pieza-error",
          `No se encontró la pieza con ID ${idPieza}`
        );
      }
    });
  } catch (err) {
    console.error("Error al redirigir al dashboard de actualización:", err);
  }
});

// Manejador para actualizar una pieza
ipcMain.handle(
  "actualizar-pieza",
  async (event, { idPieza, nombre, descripcion }) => {
    try {
      await actualizarPieza(idPieza, nombre, descripcion);
      console.log(`Pieza con ID ${idPieza} actualizada con éxito.`);
      return { success: true, message: "Pieza actualizada con éxito." };
    } catch (err) {
      console.error(`Error al actualizar la pieza con ID ${idPieza}:`, err);
      return { success: false, message: "Error al actualizar la pieza." };
    }
  }
);

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
      produccionData.idPieza,
      produccionData.folioProduccion,
      produccionData.cantidadProduccion,
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
    }, 1350); // Esperar 2000 ms (2 segundos)

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
      mainWindow.loadFile(
        "src/app/ui/pages-empleados/dashboard-actualizar-produccion.html"
      );

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
//                                              FUNCIONES PRODUCCIONES
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
