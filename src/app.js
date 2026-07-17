import viewsRouter from "./routes/views.router.js";
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";
import express from "express";
import { engine } from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Productos de prueba
let products = [
  {
    id: 1,
    title: "Notebook",
    price: 1500,
  },
  {
    id: 2,
    title: "Mouse",
    price: 30,
  },
];

// Vista Home
app.get("/", (req, res) => {
  res.render("home", { products });
});

// Vista en tiempo real
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products });
});

// WebSockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.emit("updateProducts", products);

  socket.on("addProduct", (product) => {
    product.id = Date.now();
    products.push(product);

    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (id) => {
    products = products.filter((p) => p.id != id);

    io.emit("updateProducts", products);
  });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});