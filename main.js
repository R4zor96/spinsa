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
const { insertarPieza } = require("./app/models/Tabla_piezas.js");

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
