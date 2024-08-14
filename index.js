const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/.env" });
const path = require("path");
const mongoose = require("mongoose");

// Importa as rotas de usuário
const userRoutes = require("./routes/userRoutes");

// Função para inicializar o administrador padrão
const initializeAdmin = require('./utils/initializeAdmin'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Conectando ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        return initializeAdmin(); // Executa a função para criar o administrador padrão
    })
    .catch(err => console.error("MongoDB connection error:", err));

// Usando as rotas de usuário
app.use('/api/users', userRoutes);

// Middleware de erro (opcional, para lidar com erros de forma global)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Inicia o servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
