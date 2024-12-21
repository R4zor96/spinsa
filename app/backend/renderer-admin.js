console.log("Renderer cargado correctamente");

// Leer datos del JSON y mostrarlos
function displayUserData() {
  window.electronAPI.readUserData().then((userData) => {
    if (userData) {
      console.log("Datos del usuario leídos desde el JSON:", userData);

      // Mostrar el mensaje de bienvenida
      const welcomeMessage = document.getElementById("welcomeMessage");
      if (welcomeMessage) {
        welcomeMessage.textContent = `BIENVENIDO ${userData.nombre_usuario.toUpperCase()}`;
      }

      const perfil = document.getElementById("perfil");
      if (perfil) {
        perfil.innerHTML = `Admin: ${userData.nombre_usuario}`;
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
