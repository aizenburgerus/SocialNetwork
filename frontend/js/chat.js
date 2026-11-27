const token =
    localStorage.getItem(
        "token"
    );

const params =
    new URLSearchParams(
        window.location.search
    );

const dialogId =
    params.get("dialog");

    //загрузка сообщений
async function loadMessages() {

    const response =
        await fetch(
            `http://95.165.134.144:5000/api/messages/${dialogId}`,
            {
                headers: {
                    Authorization:
                        token
                }
            }
        );

    const messages =
        await response.json();

    const container =
        document.getElementById(
            "messagesContainer"
        );

    container.innerHTML = "";

    messages.forEach(message => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "mb-3";

        div.innerHTML = `
    <b>
        ${message.username}
    </b>

    <p>
        ${message.message}
    </p>
`;

        container.appendChild(
            div
        );
    });
}

loadMessages();

//отправка сообщений

document
.getElementById("sendBtn")
.addEventListener(
    "click",
    async () => {

        const content =
            document.getElementById(
                "messageInput"
            ).value;

        await fetch(
            `http://95.165.134.144:5000/api/messages/${dialogId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        token
                },

                body: JSON.stringify({
                    content
                })
            }
        );

        document.getElementById(
            "messageInput"
        ).value = "";

        loadMessages();
    }
);