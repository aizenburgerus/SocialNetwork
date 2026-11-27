const express = require("express");

const router = express.Router();

const pool = require("../db");

const authMiddleware =
    require("../middleware/auth");

//Создание диалога или его начало

router.post(
    "/dialog/:userId",
    authMiddleware,
    async (req, res) => {

        try {

            const currentUser =
                req.user.id;

            const secondUser =
                req.params.userId;

            let dialog =
                await pool.query(
                    `
                    SELECT *
                    FROM dialogs

                    WHERE

                    (
                        user1_id = $1
                        AND
                        user2_id = $2
                    )

                    OR

                    (
                        user1_id = $2
                        AND
                        user2_id = $1
                    )
                    `,
                    [
                        currentUser,
                        secondUser
                    ]
                );

            if (
                dialog.rows.length === 0
            ) {

                dialog =
                    await pool.query(
                        `
                        INSERT INTO dialogs
                        (
                            user1_id,
                            user2_id
                        )

                        VALUES
                        (
                            $1,
                            $2
                        )

                        RETURNING *
                        `,
                        [
                            currentUser,
                            secondUser
                        ]
                    );
            }

            res.json(
                dialog.rows[0]
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

//Получение сообщений

router.get(
    "/:dialogId",
    authMiddleware,
    async (req, res) => {

        try {

            const messages =
                await pool.query(
                    `
                    SELECT
                        messages.*,
                        users.username

                    FROM messages

                    JOIN users
                    ON users.id =
                    messages.sender_id

                    WHERE dialog_id = $1

                    ORDER BY created_at ASC
                    `,
                    [
                        req.params.dialogId
                    ]
                );

            res.json(
                messages.rows
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

//ОТправка сообщений

router.post(
    "/:dialogId",
    authMiddleware,
    async (req, res) => {

        try {

            const { content } =
                req.body;

            const message =
                await pool.query(
                    `
                    INSERT INTO messages
                    (
                        dialog_id,
                        sender_id,
                        message
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )

                    RETURNING *
                    `,
                    [
                        req.params.dialogId,
                        req.user.id,
                        content
                    ]
                );

            res.json(
                message.rows[0]
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

module.exports = router;