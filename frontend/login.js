document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let message = document.getElementById("message");

    fetch("http://127.0.0.1:5000/api/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        console.log(data);

        message.textContent = data.message;

        if (data.user_id) {

            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("user_name", data.name);
            localStorage.setItem("user_email", data.email);

            setTimeout(function() {
                window.location.href = "index.html";
            }, 1000);
        }

    })

    .catch(error => {

        console.error(error);

        message.textContent = "Login failed.";

    });

});w