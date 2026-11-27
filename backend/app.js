require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
    "/api/messages",
    messageRoutes
);

app.use(
    "/uploads",
    express.static("uploads")
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/posts",
    postRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.get("/", (req, res) => {

    res.json({
        message: "Social Network API"
    });
});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server started on ${PORT}`
    );
});