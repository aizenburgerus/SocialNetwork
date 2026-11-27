const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


// Проверка авторизации

if (!token || !user) {

    window.location.href = "./login.html";
}

async function loadProfile() {

    try {

        const response =
            await fetch(
                "http://95.165.134.144:5000/api/users/me",
                {
                    headers: {
                        Authorization: token
                    }
                }
            );

        const profile =
            await response.json();

        document.getElementById(
            "username"
        ).innerText =
            profile.username;

        document.getElementById(
            "email"
        ).innerText =
            profile.email;

        if (profile.avatar) {

            document.getElementById(
                "avatarImage"
            ).src =
                `http://95.165.134.144:5000/uploads/${profile.avatar}`;
        }

        document.getElementById(
            "bioText"
        ).innerText =
            profile.bio || "Нет описания";

        document.getElementById(
            "bioInput"
        ).value =
            profile.bio || "";

    } catch (error) {

        console.log(error);
    }
}

loadProfile();


// Данные пользователя

document.getElementById("username").innerText =
    user.username;

document.getElementById("email").innerText =
    user.email;


// Выход

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "./login.html";
});


// Контейнер постов

const postsContainer =
    document.getElementById("postsContainer");


// Загрузка постов

async function loadPosts() {

    try {

        const response = await fetch(
            "http://95.165.134.144:5000/api/posts"
        );

        const posts = await response.json();

        postsContainer.innerHTML = "";

        posts.forEach(post => {

            const postElement =
                document.createElement("div");

            postElement.className =
                "bg-white rounded-2xl shadow p-6";

            postElement.innerHTML = `
                <h4 class="font-bold text-lg mb-2">
                    ${post.username}
                </h4>

                <p class="text-gray-700 break-all">
    ${post.content}
</p>

                <div class="flex gap-4 mt-4">

                    <button
                        class="likeBtn text-red-500"
                        data-id="${post.id}"
                    >
                        ❤ ${post.likes_count}
                    </button>

                </div>

                <!-- Комментарии -->

                <div
                    class="commentsContainer mt-4 space-y-2"
                ></div>

                <!-- Форма комментария -->

                <div class="mt-4">

                    <input
                        type="text"
                        placeholder="Комментарий..."
                        class="commentInput border rounded p-2 w-full"
                    >

                    <button
                        class="commentBtn bg-blue-500 text-white px-3 py-2 rounded mt-2"
                        data-id="${post.id}"
                    >
                        Отправить
                    </button>

                </div>

                <p class="text-gray-400 text-sm mt-4">
                    ${new Date(post.created_at).toLocaleString()}
                </p>
            `;

            postsContainer.appendChild(postElement);


            // ===== ЛАЙК =====

            const likeBtn =
                postElement.querySelector(".likeBtn");

            likeBtn.addEventListener("click", async () => {

                try {

                    await fetch(
                        `http://95.165.134.144:5000/api/posts/${post.id}/like`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization": token
                            }
                        }
                    );

                    loadPosts();

                } catch (error) {

                    console.log(error);
                }
            });


            // ===== КОММЕНТАРИИ =====

            const commentsContainer =
                postElement.querySelector(
                    ".commentsContainer"
                );


            // Загрузка комментариев

            async function loadComments() {

                try {

                    const response = await fetch(
                        `http://95.165.134.144:5000/api/posts/${post.id}/comments`
                    );

                    const comments = await response.json();

                    commentsContainer.innerHTML = "";

                    comments.forEach(comment => {

                        const commentElement =
                            document.createElement("div");

                        commentElement.className =
                            "bg-gray-100 rounded-lg p-3";

                        commentElement.innerHTML = `
    <div class="flex justify-between">

        <div>

            <p class="font-bold text-sm">
                ${comment.username}
            </p>

            <p class="text-gray-700">
                ${comment.content}
            </p>

        </div>

        ${
            comment.user_id === user.id
            ? `
                <button
                    class="deleteCommentBtn text-red-500"
                    data-id="${comment.id}"
                >
                    ✖
                </button>
            `
            : ""
        }

    </div>
`;

                        commentsContainer.appendChild(
                            commentElement
                        );
                        const deleteBtn =
    commentElement.querySelector(
        ".deleteCommentBtn"
    );

if (deleteBtn) {

    deleteBtn.addEventListener(
        "click",
        async () => {

            if (
                !confirm(
                    "Удалить комментарий?"
                )
            ) {
                return;
            }

            try {

                await fetch(
    `http://95.165.134.144:5000/api/posts/comments/${comment.id}`,
    {
        method: "DELETE",
        headers: {
            Authorization: token
        }
    }
);

                loadComments();

            } catch (error) {

                console.log(error);
            }
        }
    );
}
                    });

                } catch (error) {

                    console.log(error);
                }
            }


            // Загружаем комментарии

            loadComments();


            // ===== ДОБАВЛЕНИЕ КОММЕНТАРИЯ =====

            const commentBtn =
                postElement.querySelector(".commentBtn");

            commentBtn.addEventListener("click", async () => {

                const input =
                    postElement.querySelector(".commentInput");

                const content = input.value;

                if (!content.trim()) {
                    return;
                }

                try {

                    await fetch(
                        `http://95.165.134.144:5000/api/posts/${post.id}/comments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": token
                            },

                            body: JSON.stringify({
                                content
                            })
                        }
                    );

                    input.value = "";

                    loadComments();

                } catch (error) {

                    console.log(error);
                }
            });

        });

    } catch (error) {

        console.log(error);
    }
}


// СОЗДАНИЕ ПОСТА

document.getElementById("createPostBtn")
.addEventListener("click", async () => {

    const content =
        document.getElementById("postContent").value;

    if (!content.trim()) {
        return;
    }

    try {

        const response = await fetch(
            "http://95.165.134.144:5000/api/posts",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization": token
                },

                body: JSON.stringify({
                    content
                })
            }
        );

        if (response.ok) {

            document.getElementById(
                "postContent"
            ).value = "";

            loadPosts();
        }

    } catch (error) {

        console.log(error);
    }
});

// ЗАГРУЗКА ПРИ СТАРТЕ

loadPosts();

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );


searchBtn.addEventListener(
    "click",
    async () => {

        const query =
            searchInput.value;

        if (!query.trim()) {
            return;
        }

        try {

            const response =
                await fetch(
                    `http://95.165.134.144:5000/api/users/search?q=${query}`
                );

            const users =
                await response.json();

            searchResults.classList.remove(
                "hidden"
            );

            searchResults.innerHTML = `
                <h3 class="text-xl font-bold mb-4">
                    Результаты поиска
                </h3>
            `;

            users.forEach(foundUser => {

                const userCard =
                    document.createElement(
                        "div"
                    );

                userCard.className =
                    "border-b py-4 flex justify-between items-center";

                userCard.innerHTML = `
                    <div>

                        <h4
    class="font-bold cursor-pointer text-blue-500"
>
    ${foundUser.username}
</h4>

                        <p class="text-gray-500">
                            ${foundUser.bio || ""}
                        </p>

                    </div>

                    <button
                        class="followBtn bg-green-500 text-white px-4 py-2 rounded"
                        data-id="${foundUser.id}"
                    >
                        Подписаться
                    </button>
                `;

                searchResults.appendChild(
                    userCard
                );

                userCard
.querySelector("h4")
.addEventListener(
    "click",
    () => {

        window.location.href =
            `user.html?id=${foundUser.id}`;
    }
);

                const followBtn =
                    userCard.querySelector(
                        ".followBtn"
                    );

                followBtn.addEventListener(
                    "click",
                    async () => {

                        try {

                            await fetch(
                                `http://95.165.134.144:5000/api/users/${foundUser.id}/follow`,
                                {
                                    method:
                                        "POST",

                                    headers: {
                                        Authorization:
                                            token
                                    }
                                }
                            );

                            followBtn.innerText =
                                "Подписка оформлена";

                            followBtn.disabled =
                                true;

                        } catch (error) {

                            console.log(
                                error
                            );
                        }
                    }
                );
            });

        } catch (error) {

            console.log(error);
        }
    }
);

const avatarInput =
    document.getElementById(
        "avatarInput"
    );

avatarInput.addEventListener(
    "change",
    async (e) => {

        const file =
            e.target.files[0];

        if (!file) {
            return;
        }

        const formData =
            new FormData();

        formData.append(
            "avatar",
            file
        );

        try {

            const response =
                await fetch(
                    "http://95.165.134.144:5000/api/users/avatar",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                token
                        },

                        body: formData
                    }
                );

            const data =
                await response.json();

            document.getElementById(
                "avatarImage"
            ).src =
                `http://95.165.134.144:5000/uploads/${data.avatar}`;

        } catch (error) {

            console.log(error);
        }
    }
);

const saveBioBtn =
    document.getElementById(
        "saveBioBtn"
    );

if (saveBioBtn) {

    saveBioBtn.addEventListener(
        "click",
        async () => {

            const bio =
                document.getElementById(
                    "bioInput"
                ).value;

            try {

                await fetch(
                    "http://95.165.134.144:5000/api/users/bio",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                token
                        },

                        body: JSON.stringify({
                            bio
                        })
                    }
                );

                document.getElementById(
                    "bioText"
                ).innerText = bio;

                alert(
                    "Описание сохранено"
                );

            } catch (error) {

                console.log(error);
            }
        }
    );
}

const changeUsernameBtn =
    document.getElementById(
        "changeUsernameBtn"
    );

if (changeUsernameBtn) {

    changeUsernameBtn.addEventListener(
        "click",
        async () => {

            const username =
                document.getElementById(
                    "newUsername"
                ).value;

            if (!username.trim()) {
                return;
            }

            try {

                const response =
                    await fetch(
                        "http://95.165.134.144:5000/api/users/username",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    token
                            },

                            body: JSON.stringify({
                                username
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message
                    );

                    return;
                }

                document.getElementById(
                    "username"
                ).innerText =
                    username;

                const user =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        )
                    );

                user.username =
                    username;

                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );

                alert(
                    "Имя изменено"
                );

            } catch (error) {

                console.log(error);
            }
        }
    );
}   

const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );

const editProfilePanel =
    document.getElementById(
        "editProfilePanel"
    );

editProfileBtn.addEventListener(
    "click",
    () => {

        editProfilePanel.classList.toggle(
            "hidden"
        );

        if (
            editProfilePanel.classList.contains(
                "hidden"
            )
        ) {

            editProfileBtn.innerText =
                "Редактировать профиль";

        } else {

            editProfileBtn.innerText =
                "Скрыть редактор";
        }
    }
);