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

  // Función para obtener los registros de piezas
  obtenerPiezas: () => ipcRenderer.invoke("obtener-piezas"),

  // Función para obtener una pieza por su ID
  obtenerPiezaPorId: (idPieza) =>
    ipcRenderer.invoke("obtener-pieza-por-id", idPieza),

  // Función para eliminar una pieza
  eliminarPieza: (idPieza) => ipcRenderer.invoke("eliminar-pieza", idPieza),

  // Redirigir al dashboard de actualización
  redirigirActualizarPieza: (idPieza) =>
    ipcRenderer.invoke("redirigir-actualizar-pieza", idPieza),

  // Actualizar una pieza
  actualizarPieza: (data) => ipcRenderer.invoke("actualizar-pieza", data),

  // Recibir datos de la pieza seleccionada
  onCargarPieza: (callback) =>
    ipcRenderer.on("cargar-pieza", (_event, pieza) => callback(pieza)),

  // Manejar errores al cargar la pieza
  onCargarPiezaError: (callback) =>
    ipcRenderer.on("cargar-pieza-error", (_event, error) => callback(error)),

  //=============================================================================================================
  //                                              FUNCIONES PRODUCCIONES
  //=============================================================================================================
  //Funcion para insertar producciones por su marca:
  insertarProduccion: (produccionData) =>
    ipcRenderer.invoke("insertar-produccion", produccionData),

  //Funcion para obtener las producciones por su id_marca
  obtenerProducciones: (idMarca) =>
    ipcRenderer.invoke("obtener-producciones", idMarca),

  // Función para eliminar una producción
  eliminarProduccion: (idProduccion) =>
    ipcRenderer.invoke("eliminar-produccion", idProduccion),

  // Redirigir al dashboard de actualización
  redirigirActualizarProduccion: (idProduccion) =>
    ipcRenderer.invoke("redirigir-actualizar-produccion", idProduccion),

  // Actualizar una producción
  actualizarProduccion: (data) =>
    ipcRenderer.invoke("actualizar-produccion", data),

  // Recibir datos de la producción seleccionada
  onCargarProduccion: (callback) =>
    ipcRenderer.on("cargar-produccion", (_event, produccion) =>
      callback(produccion)
    ),

  // Manejar errores al cargar la producción
  onCargarProduccionError: (callback) =>
    ipcRenderer.on("cargar-produccion-error", (_event, error) =>
      callback(error)
    ),
});
