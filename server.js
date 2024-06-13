import express from "express";
import jwt from "jsonwebtoken"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http"


const port = 8000



const app = express()
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});





//  allow requests from the specified origin http://localhost:5173, supporting GET and POST methods, and allowing credentials to be included in the requests.
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    })
);

// app.use(express.static(path.join(__dir, 'views')));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

//login user
app.get("/login", (req, res) => {

    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);

    res
        .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        .json({
            message: "Login Success",
        });
});


// WebSocket authentication middleware
io.use((socket, next) => {
    const token = socket.request.cookies.token;
    if (!token) {
        return next(new Error('Authentication error: Token not found'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.request.user = decoded;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
});


io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    socket.on("message", ({ room, message }) => {
        console.log({ room, message });
        socket.to(room).emit("receive-message", message);
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});













app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})