const form = document.getElementById("registerForm");

const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://95.165.134.144:5000/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.innerHTML = `
                <p class="text-green-600">
                    ${data.message}
                </p>
            `;

            setTimeout(() => {
                window.location.href = "./login.html";
            }, 1500);

        } else {

            message.innerHTML = `
                <p class="text-red-600">
                    ${data.message}
                </p>
            `;
        }

    } catch (error) {

        console.log(error);

        message.innerHTML = `
            <p class="text-red-600">
                Ошибка подключения к серверу или введны не верно данные
            </p>
        `;
    }
});
