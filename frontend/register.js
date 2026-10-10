document.getElementById("registerForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let message = document.getElementById("message");

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {

        message.textContent = data.message;

        console.log(data);

    })
    .catch(error => {

        console.error(error);
        message.textContent = "Registration failed.";

    });

});