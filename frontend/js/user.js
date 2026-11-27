const token =
    localStorage.getItem("token");

const params =
    new URLSearchParams(
        window.location.search
    );

const userId =
    params.get("id");

const postsContainer =
    document.getElementById(
        "postsContainer"
    );

async function loadUser() {

    try {

        const response =
            await fetch(
                `http://95.165.134.144:5000/api/users/${userId}`
            );

        const user =
            await response.json();

        document.getElementById(
            "username"
        ).innerText =
            user.username;

        document.getElementById(
            "bio"
        ).innerText =
            user.bio || "Нет описания";

        document.getElementById(
            "followers"
        ).innerText =
            user.followers;

        document.getElementById(
            "following"
        ).innerText =
            user.following;

        if (user.avatar) {

            document.getElementById(
                "avatar"
            ).src =
                `http://95.165.134.144:5000/uploads/${user.avatar}`;
        }

    } catch (error) {

        console.log(error);
    }
}

async function loadPosts() {

    try {

        const response =
            await fetch(
                "http://95.165.134.144:5000/api/posts"
            );

        const posts =
            await response.json();

        postsContainer.innerHTML = "";

        posts
            .filter(
                post =>
                    post.user_id ==
                    userId
            )
            .forEach(post => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "bg-white rounded-2xl shadow p-6";

                card.innerHTML = `
                    <h3 class="font-bold">
                        ${post.username}
                    </h3>

                    <p class="mt-2">
                        ${post.content}
                    </p>
                `;

                postsContainer.appendChild(
                    card
                );
            });

    } catch (error) {

        console.log(error);
    }
}

document
.getElementById("followBtn")
.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                `http://95.165.134.144:5000/api/users/${userId}/follow`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            token
                    }
                }
            );

            alert(
                "Подписка оформлена"
            );

            loadUser();

        } catch (error) {

            console.log(error);
        }
    }
);

document
.getElementById("messageBtn")
.addEventListener(
    "click",
    async () => {

        const response =
            await fetch(
                `http://95.165.134.144:5000/api/messages/dialog/${userId}`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            token
                    }
                }
            );

        const dialog =
            await response.json();

        window.location.href =
            `chat.html?dialog=${dialog.id}`;
    }
);

loadUser();
loadPosts();