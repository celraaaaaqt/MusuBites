    const loginForm = document.querySelector("#loginForm");
    const username = document.querySelector("#email");
    const password = document.querySelector("#password");
    const error = document.querySelector("#error");

    loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (username.value === "admin@gmail.com" && password.value === "password123") {
        window.location.href = "dashboard.html";
    } else {
        error.textContent = "Invalid username or password.";
    }
    });