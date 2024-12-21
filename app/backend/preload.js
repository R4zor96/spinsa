const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload cargado correctamente");

// Exponer las funciones necesarias al renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Función para enviar credenciales al proceso principal
  ejecutarLogin: (correo, password) =>
    ipcRenderer.send("login-attempt", { correo, password }),

  //=============================================================================================================
  //                                              FUNCIONES JSON
  //=============================================================================================================
  // Función para leer datos del JSON
  readUserData: () => ipcRenderer.invoke("read-user-data"),

  // Función para guardar datos en el JSON
  saveUserData: (data) => ipcRenderer.invoke("save-user-data", data),

  // Función para eliminar el JSON
  clearUserData: () => ipcRenderer.invoke("clear-user-data"),

  // Escuchar eventos desde el proceso principal
  onUserData: (callback) => ipcRenderer.on("user-data", callback),

  //=============================================================================================================
  //                                              FUNCIONES PIEZAS
  //=============================================================================================================
  // Función para insertar pieza
  insertarPieza: (nombrePieza, descripcionPieza) =>
    ipcRenderer.invoke("insertar-pieza", { nombrePieza, descripcionPieza }),
});
