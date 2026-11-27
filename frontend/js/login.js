const form = document.getElementById("loginForm");

const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "http://95.165.134.144:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            // Сохраняем JWT

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            message.innerHTML = `
                <p class="text-green-600">
                    Вход выполнен
                </p>
            `;

            // Переход в профиль

            setTimeout(() => {
                window.location.href = "./profile.html";
            }, 1000);

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
                Ошибка сервера
            </p>
        `;
    }
});