const loginBtn = document.getElementById("loginBtn");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página

  const correo = correoInput.value;
  const password = passwordInput.value;

  if (!correo || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  console.log("window.electronAPI: ", window.electronAPI);

  // Envía las credenciales al proceso principal
  window.electronAPI.ejecutarLogin(correo, password);
});
