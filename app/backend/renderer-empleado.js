console.log("Renderer cargado correctamente");
//=============================================================================================================
//                                              FUNCIONES DATOS JSON
//=============================================================================================================
// Leer datos del JSON y mostrarlos
function displayUserData() {
  window.electronAPI.readUserData().then((userData) => {
    if (userData) {
      console.log("Datos del usuario leídos desde el JSON:", userData);

      // Asignar el valor de la Marca
      const obtenerMarca = document.getElementById("obtenerMarca");
      if (obtenerMarca) {
        obtenerMarca.innerHTML = `<input type="hidden" id="idMarca" value="${userData.id_marca}">`;
      }

      // Asignar el valor del usuario
      const obtenerUsuario = document.getElementById("obtenerUsuario");
      if (obtenerUsuario) {
        obtenerUsuario.innerHTML = `<input type="hidden" id="idUsuario" value="${userData.id_usuario}">`;
      }

      // Mostrar el mensaje de bienvenida
      const welcomeMessage = document.getElementById("welcomeMessage");
      if (welcomeMessage) {
        welcomeMessage.textContent = `BIENVENIDO ${userData.nombre_usuario.toUpperCase()}`;
      }

      // Mostrar la marca
      const tituloMarca = document.getElementById("tituloMarca");
      id_marca = userData.id_marca;
      if (tituloMarca && id_marca) {
        switch (id_marca) {
          case 1:
            tituloMarca.textContent = `VOLKSWAGEN`;
            break;
          case 2:
            tituloMarca.textContent = `TESLA`;
            break;
          case 3:
            tituloMarca.textContent = `PENTA NOVA`;
            break;
          case 4:
            tituloMarca.textContent = `AUDI`;
            break;
        }
      } else {
        console.log("error, id_marca es nulo");
      }

      //Mostrar nombre en el perfil
      const perfil = document.getElementById("perfil");
      if (perfil) {
        perfil.innerHTML = `Empleado: ${userData.nombre_usuario}`;
      }

      //Mostrar nombre en el perfil
      const perfil2 = document.getElementById("perfil2");
      if (perfil2) {
        perfil2.innerHTML = `Admin: ${userData.nombre_usuario}`;
      }
      //=========EJEMPLO=====================================
      // Mostrar otros datos si es necesario
      const userInfo = document.getElementById("userInfo");
      if (userInfo) {
        userInfo.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.nombre_usuario}</p>
          <p><strong>Email:</strong> ${userData.correo_usuario}</p>
          <p><strong>Rol:</strong> ${userData.id_rol}</p>
        `;
      }
      //======================================================
    } else {
      console.warn("No se encontraron datos de usuario en el archivo JSON.");
    }
  });
}

// Eliminar el archivo JSON al cerrar sesión
function clearUserData() {
  window.electronAPI.clearUserData().then(() => {
    console.log("Archivo JSON eliminado, cerrando sesión...");
    window.location.href = "../index.html"; // Redirigir a la página de inicio de sesión
  });
}

// Solicitar datos al cargar el dashboard
document.addEventListener("DOMContentLoaded", () => {
  displayUserData();
});
