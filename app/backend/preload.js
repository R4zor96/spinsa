const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload cargado correctamente");

// Exponer las funciones necesarias al renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Función para enviar credenciales al proceso principal
  ejecutarLogin: (correo, password) =>
    ipcRenderer.send("login-attempt", { correo, password }),

  obtenerProduccionesPorDiaSemana: () =>
    ipcRenderer.invoke("obtener-producciones-por-dia-semana"), // Debe coincidir con el nombre del canal en main.js
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
  //                                              FUNCIONES PRODUCCIONES
  //=============================================================================================================

  //Funcion para insertar producciones por su marca:
  insertarProduccion: (produccionData) =>
    ipcRenderer.invoke("insertar-produccion", produccionData),

  //Funcion obtenewr todas las producciones
  obtenerTodasLasProducciones: () =>
    ipcRenderer.invoke("obtener-todas-las-producciones"),

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

  //=============================================================================================================
  //                                              FUNCIONES USUARIOS
  //=============================================================================================================
  // Obtener información del usuario
  obtenerUsuarioPorId: (idUsuario) =>
    ipcRenderer.invoke("obtener-usuario-por-id", idUsuario),

  // Actualizar información del usuario
  actualizarUsuario: (idUsuario, datos) =>
    ipcRenderer.invoke("actualizar-usuario", { idUsuario, datos }),

  //=============================================================================================================
  //                                              FUNCIONES INVENTARIOS
  //=============================================================================================================
  // Función para insertar un nuevo inventario
  insertarInventario: (inventarioData) =>
    ipcRenderer.invoke("insertar-inventario", inventarioData),

  //Obtener inventarios
  obtenerInventarios: (idMarca) =>
    ipcRenderer.invoke("obtener-inventarios", idMarca),

  // Función para eliminar un inventario
  eliminarInventario: (idInventario) =>
    ipcRenderer.invoke("eliminar-inventario", idInventario),

  //Funcion redirigir al dashboard
  redirigirActualizarInventario: (idInventario) =>
    ipcRenderer.invoke("redirigir-actualizar-inventario", idInventario),

  //Actualizar inventario
  actualizarInventario: (idInventario, datos) =>
    ipcRenderer.invoke("actualizar-inventario", { idInventario, datos }),

  // Escuchar datos del inventario
  onCargarInventario: (callback) =>
    ipcRenderer.on("cargar-inventario", (_event, inventario) =>
      callback(inventario)
    ),

  // Manejar errores al cargar el inventario
  onCargarInventarioError: (callback) =>
    ipcRenderer.on("cargar-inventario-error", (_event, error) =>
      callback(error)
    ),

  // Función para obtener *todos* los inventarios
  obtenerTodosLosInventarios: () =>
    ipcRenderer.invoke("obtener-todos-los-inventarios"),
});
