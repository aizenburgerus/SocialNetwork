const upload =
    require("../middleware/upload");

const express = require("express");

const router = express.Router();

const pool = require("../db");

const authMiddleware =
    require("../middleware/auth");


// Поиск пользователей

router.get("/search", async (req, res) => {

    try {

        const query = req.query.q;

        const users = await pool.query(
            `
            SELECT
                id,
                username,
                avatar,
                bio
            FROM users
            WHERE username ILIKE $1
            LIMIT 20
            `,
            [`%${query}%`]
        );

        res.json(users.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// Информация о себе

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {

        try {

            const user =
                await pool.query(
                    `
                    SELECT
                        id,
                        username,
                        email,
                        avatar,
                        bio
                    FROM users
                    WHERE id = $1
                    `,
                    [req.user.id]
                );

            res.json(
                user.rows[0]
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

// Подписаться

router.post(
    "/:id/follow",
    authMiddleware,
    async (req, res) => {

        try {

            const followerId =
                req.user.id;

            const followingId =
                req.params.id;

            if (
                Number(followerId) ===
                Number(followingId)
            ) {

                return res.status(400).json({
                    message:
                        "Нельзя подписаться на себя"
                });
            }

            await pool.query(
                `
                INSERT INTO subscriptions
                (
                    follower_id,
                    following_id
                )
                VALUES ($1,$2)
                ON CONFLICT DO NOTHING
                `,
                [
                    followerId,
                    followingId
                ]
            );

            res.json({
                message:
                    "Подписка оформлена"
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


// Отписаться

router.delete(
    "/:id/follow",
    authMiddleware,
    async (req, res) => {

        try {

            await pool.query(
                `
                DELETE FROM subscriptions
                WHERE follower_id = $1
                AND following_id = $2
                `,
                [
                    req.user.id,
                    req.params.id
                ]
            );

            res.json({
                message:
                    "Подписка отменена"
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

//Смена имени

router.put(
    "/username",
    authMiddleware,
    async (req, res) => {

        try {

            const { username } =
                req.body;

            if (!username) {

                return res.status(400).json({
                    message:
                        "Введите имя пользователя"
                });
            }

            const exists =
                await pool.query(
                    `
                    SELECT *
                    FROM users
                    WHERE username = $1
                    `,
                    [username]
                );

            if (
                exists.rows.length > 0
            ) {

                return res.status(400).json({
                    message:
                        "Имя уже занято"
                });
            }

            await pool.query(
                `
                UPDATE users
                SET username = $1
                WHERE id = $2
                `,
                [
                    username,
                    req.user.id
                ]
            );

            res.json({
                message:
                    "Имя обновлено"
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

// Получить профиль

router.get("/:id", async (req, res) => {

    try {

        const userId =
            req.params.id;

        const user = await pool.query(
            `
            SELECT
                id,
                username,
                avatar,
                bio
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        if (
            user.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Пользователь не найден"
            });
        }

        const followers =
            await pool.query(
                `
                SELECT COUNT(*)
                FROM subscriptions
                WHERE following_id = $1
                `,
                [userId]
            );

        const following =
            await pool.query(
                `
                SELECT COUNT(*)
                FROM subscriptions
                WHERE follower_id = $1
                `,
                [userId]
            );

        res.json({

            ...user.rows[0],

            followers:
                followers.rows[0].count,

            following:
                following.rows[0].count
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Ошибка сервера"
        });
    }
});

// Роут загрузки авок

router.post(
    "/avatar",
    authMiddleware,
    upload.single("avatar"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Файл не загружен"
                });
            }

            const avatarPath =
                req.file.filename;

            await pool.query(
                `
                UPDATE users
                SET avatar = $1
                WHERE id = $2
                `,
                [
                    avatarPath,
                    req.user.id
                ]
            );

            res.json({
                avatar: avatarPath
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

router.put(
    "/bio",
    authMiddleware,
    async (req, res) => {

        try {

            const { bio } = req.body;

            await pool.query(
                `
                UPDATE users
                SET bio = $1
                WHERE id = $2
                `,
                [
                    bio,
                    req.user.id
                ]
            );

            res.json({
                message:
                    "Описание обновлено"
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