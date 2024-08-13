// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Definindo o Schema do Usuário
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Garante que o nome de usuário seja único
    },
    email: {
        type: String,
        required: true,
        unique: true, // Garante que o email seja único
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'] // Valida o formato do email
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Senha deve ter pelo menos 6 caracteres
    },
    isAdmin: {
        type: Boolean,
        default: false // Define se o usuário é um administrador
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

// Hook para hash de senha antes de salvar o usuário
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar a senha fornecida com a senha armazenada
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Criando o Model com o Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
