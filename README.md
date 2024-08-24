# 🏫 School API

A RESTful API para gerenciamento de usuários, estudantes, professores e cursos. Esta API permite realizar operações CRUD para cada entidade e inclui funcionalidades adicionais para instalação e notificações.

## 📚 Sumário

- [🚀 Começando](#-começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)

## 🚀 Começando

Para iniciar o projeto localmente, siga estes passos:

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [MongoDB](https://www.mongodb.com/) (local ou via Atlas)

### Instalação

1. Certifique-se de ter o Node.js instalado em seu sistema.
2. Faça o clone deste repositório em sua máquina local:

   ```bash
   git clone https://github.com/MarjoryMel/school-api
   
3. Abra o terminal e execute *npm install* para instalar todas as dependências necessárias:
4. Após a instalação bem-sucedida, execute *npm start* para iniciar o servidor.

## 📂 Estrutura do Projeto

- **/school-api**
  - **/config/**
    - `.env`
  - **/controllers/**
    - `userController.js`
    - `professorController.js`
    - `courseController.js`
    - `studentController.js`
    - `installController.js`
  - **/routes/**
    - `userRoutes.js`
    - `studentRoutes.js`
    - `courseRoutes.js`
    - `professorRoutes.js`
    - `notificationRoutes.js`
    - `installRoutes.js`
  - **/models/**
    - `userModel.js`
    - `studentModel.js`
    - `courseModel.js`
    - `professorModel.js`
  - **/utils/**
    - `errorMessages.js`
    - `middlewares.js`
    - `support.js`
  - **/validators/**
    - `courseValidator.js`
    - `professorValidator.js`
    - `studentValidator.js`
    - `userValidator.js`
  - `index.js`
  - `package.json`
  - `README.md`

