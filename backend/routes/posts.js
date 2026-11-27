const express = require("express");

const router = express.Router();

const pool = require("../db");

const authMiddleware = require("../middleware/auth");


// Создать пост

router.post("/", authMiddleware, async (req, res) => {

    try {

        const { content } = req.body;

        const userId = req.user.id;

        const newPost = await pool.query(
            `
            INSERT INTO posts (user_id, content)
            VALUES ($1, $2)
            RETURNING *
            `,
            [userId, content]
        );

        res.json(newPost.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});


// Получить все посты

router.get("/", async (req, res) => {

    try {

        const posts = await pool.query(
            `
            SELECT
            posts.id,
            posts.content,
            posts.created_at,
            users.username,

    (
            SELECT COUNT(*)
            FROM likes
            WHERE likes.post_id = posts.id
    ) AS likes_count
            FROM posts
            JOIN users
            ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
            `
        );

        res.json(posts.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Лайк поста

router.post("/:id/like", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;

        const userId = req.user.id;

        // Проверка лайка

        const existingLike = await pool.query(
            `
            SELECT * FROM likes
            WHERE user_id = $1
            AND post_id = $2
            `,
            [userId, postId]
        );

        // Если лайк уже есть — удаляем

        if (existingLike.rows.length > 0) {

            await pool.query(
                `
                DELETE FROM likes
                WHERE user_id = $1
                AND post_id = $2
                `,
                [userId, postId]
            );

            return res.json({
                liked: false
            });
        }

        // Добавляем лайк

        await pool.query(
            `
            INSERT INTO likes (user_id, post_id)
            VALUES ($1, $2)
            `,
            [userId, postId]
        );

        res.json({
            liked: true
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Добавить комментарий

router.post("/:id/comments", authMiddleware, async (req, res) => {

    try {

        const postId = req.params.id;

        const userId = req.user.id;

        const { content } = req.body;

        const newComment = await pool.query(
            `
            INSERT INTO comments
            (post_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [postId, userId, content]
        );

        res.json(newComment.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

//Показ комментариев

router.get(
    "/:id/comments",
    async (req, res) => {

        try {

            const comments =
                await pool.query(
                    `
                    SELECT
                        comments.*,
                        users.username
                    FROM comments
                    JOIN users
                    ON users.id = comments.user_id
                    WHERE post_id = $1
                    ORDER BY created_at ASC
                    `,
                    [req.params.id]
                );

            res.json(
                comments.rows
            );

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    "Ошибка сервера"
            });
        }
    }
);

router.delete(
    "/comments/:commentId",
    authMiddleware,
    async (req, res) => {

        try {

            const comment =
                await pool.query(
                    `
                    SELECT *
                    FROM comments
                    WHERE id = $1
                    `,
                    [req.params.commentId]
                );

            if (
                comment.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Комментарий не найден"
                });
            }

            if (
                comment.rows[0].user_id !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "Нет доступа"
                });
            }

            await pool.query(
                `
                DELETE FROM comments
                WHERE id = $1
                `,
                [req.params.commentId]
            );

            res.json({
                message:
                    "Комментарий удалён"
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    "Ошибка сервера"
            });
        }
    }
);

module.exports = router;