const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();


// Регистрация

router.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // Проверка пользователя

        const userExists = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                message: "Пользователь уже существует"
            });
        }

        // Хэширование

        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(password, salt);

        // Создание пользователя

        const newUser = await pool.query(
            `INSERT INTO users
            (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email`,
            [username, email, passwordHash]
        );

        res.json({
            message: "Регистрация успешна",
            user: newUser.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});


// Авторизация

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Поиск пользователя

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({
                message: "Неверный email"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password_hash
        );

        if (!validPassword) {
            return res.status(400).json({
                message: "Неверный пароль"
            });
        }

        // JWT

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Вход выполнен",
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

module.exports = router;
