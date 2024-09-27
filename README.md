<div align="center">
  <h1>:star2: SCHOOL API :star2:</h1>
  <img src="imgs/school-img.png" alt="School Logo">
</div>

A RESTful API para gerenciamento de usuários, estudantes, professores e cursos. Esta API permite realizar operações CRUD para cada entidade e inclui funcionalidades adicionais para instalação e busca no banco de dados. Documentada com Swagger!

# 📑 Sumário

- [Começando](#-começando)
- [Tecnologias Usadas](#-tecnologias-usadas)
- [Gerenciamento de Usuários](#-gerenciamento-de-usuários)
- [Gerenciamento de Professores](#-gerenciamento-de-professores)
- [Gerenciamento de Estudantes](#-gerenciamento-de-estudantes)
- [Gerenciamento de Cursos](#-gerenciamento-de-cursos)
- [Contato](#-contato)

# 🚀 Começando

Para iniciar o projeto localmente, siga estes passos:

### Pré-requisitos

Recomendo deixar ativida a opção de instalar o MongoDB Compass (GUI) ao instalar o Community Server!

- [Node.js](https://nodejs.org/) 
- [MongoDB](https://www.mongodb.com/)
  - [Mongo Community Server](https://www.mongodb.com/try/download/community) 
  - [Mongo Shell](https://www.mongodb.com/try/download/shell)

### Instalação

1. Certifique-se de ter o Node.js instalado em seu sistema.
2. Faça o clone deste repositório em sua máquina local:

   ```bash
   git clone https://github.com/marjorymell/school-api
   
3. Abra o terminal e execute *npm install* para instalar todas as dependências necessárias:
4. Após a instalação bem-sucedida, execute *npm start* para iniciar o servidor.
5. Com o servidor em execução, você pode instalar entidades base no banco de dados, incluindo um administrador nativo, acessando o seguinte endpoint:

   - **Via navegador:** [http://localhost:3000/api/install](http://localhost:3000/api/install)
   - **Via Postman:** Crie uma requisição GET para `http://localhost:3000/api/install`.
   - **Via Swagger:** Navegue até a [documentação Swagger](http://localhost:3000/api/docs) e encontre o endpoint `/install` para executá-lo.

Certifique-se de que o servidor esteja rodando antes de fazer a requisição.

# 💻 Tecnologias Usadas

Este projeto utiliza as seguintes tecnologias e dependências:

- **Node.js**: Ambiente de execução para JavaScript.
- **Express**: Framework para Node.js que facilita a construção de APIs RESTful.
- **MongoDB**: Banco de dados NoSQL orientado a documentos, usado para armazenar dados da aplicação.
- **Mongoose**: Biblioteca de modelagem de dados do MongoDB para Node.js, que fornece uma solução baseada em esquemas para modelar os dados da aplicação.
- **JWT (jsonwebtoken)**: Biblioteca para gerar e validar tokens JWT para autenticação e autorização.
- **Joi**: Biblioteca para validação de esquemas de objetos JavaScript, usada para validar dados de entrada.
- **Bcrypt**: Biblioteca para hashing de senhas, usada para criptografar e verificar senhas de usuários.
- **dotenv**: Módulo para carregar variáveis de ambiente a partir de um arquivo `.env`.
- **Nodemon**: Ferramenta que monitora mudanças no código e reinicia automaticamente o servidor durante o desenvolvimento.
- **Swagger UI**: Interface visual para documentar e testar endpoints da API.

# 👤 Gerenciamento de Usuários

A API fornece funcionalidades para o gerenciamento de usuários, incluindo a criação, autenticação, listagem, atualização e exclusão de usuários. Abaixo estão as principais operações suportadas:

### Rotas e Funcionalidades

- **`POST /users`**: Registra um novo usuário com *username*, *email* e *password*. Todos os campos são obrigatórios. A senha é automaticamente criptografada antes de ser armazenada.

- **`POST /users/login`**: Realiza a autenticação de um usuário. Recebe *username* e *password*, verifica as credenciais e retorna um token JWT em caso de sucesso.

- **`GET /users/list`**: Lista todos os usuários cadastrados. Disponível apenas para administradores. Suporta paginação com parâmetros *limit* e *page* na query.

- **`PUT /users/:id`**: Atualiza as informações de um usuário especificado pelo *id*. Usuários comuns podem atualizar apenas suas próprias informações, enquanto administradores podem atualizar qualquer usuário.

- **`DELETE /users/:id`**: Remove um usuário especificado pelo *id*. Apenas administradores podem realizar esta operação. Não é permitido remover outros administradores.

- **`POST /users/admin`**: Cria um novo administrador. Apenas usuários já autenticados como administradores podem executar esta ação.

### Modelos

O modelo de usuário (`User`) inclui os seguintes campos:

- **`username`**: Nome de usuário único e obrigatório.
- **`email`**: Endereço de e-mail único e obrigatório.
- **`password`**: Senha obrigatória, armazenada de forma segura após criptografia.
- **`isAdmin`**: Booleano que indica se o usuário tem privilégios administrativos. Padrão é false.

### Exemplos de Resposta

#### Criação de Usuário

**Request:**
```http
POST /users
Content-Type: application/json

{
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "securepassword123"
}
```

# 👩‍🏫 Gerenciamento de Professores

O gerenciamento de professores oferece funcionalidades para criar, listar, atualizar, e excluir professores. Abaixo estão as principais operações suportadas:

### Rotas e Funcionalidades

- **`POST /professors`**: Cria um novo professor com *userId*, *firstName*, *lastName*, *courses* (opcional) e *officeLocation* (opcional). Disponível apenas para administradores.

- **`GET /professors/list`**: Lista todos os professores. Suporta paginação com parâmetros *limit* e *page*. Disponível para todos os usuários autenticados.

- **`GET /professors/:id`**: Obtém os detalhes de um professor específico pelo *id*. Disponível para todos os usuários autenticados.

- **`PUT /professors/:id`**: Atualiza as informações de um professor especificado pelo *id*. Campos atualizáveis incluem *firstName*, *lastName*, *courses*, e *officeLocation*. Professores podem atualizar apenas suas próprias informações, enquanto administradores podem atualizar qualquer usuário.

- **`DELETE /professors/:id`**: Remove um professor especificado pelo *id*. Apenas administradores.

### Modelos

O modelo de professor (`Professor`) inclui os seguintes campos:

- **`userId`**: ID do usuário associado (obrigatório).
- **`firstName`**: Primeiro nome do professor (obrigatório).
- **`lastName`**: Sobrenome do professor (obrigatório).
- **`courses`**: Lista de IDs de cursos associados (opcional).
- **`officeLocation`**: Localização do escritório do professor (opcional).

### Exemplos de Resposta

#### Criação de Professor

**Request:**
```http
POST /professors
Content-Type: application/json
Authorization: Bearer <token>

{
    "userId": "60d5f4f0e5b7c4a568d8c1a4",
    "firstName": "Maria",
    "lastName": "Oliveira",
    "courses": ["60d5f4f0e5b7c4a568d8c1b5"],
    "officeLocation": "Sala 101"
}
```


# 👤 Gerenciamento de Estudantes

O gerenciamento de estudantes oferece funcionalidades para criar, listar, atualizar, e excluir estudantes. Abaixo estão as principais operações suportadas:

### Rotas e Funcionalidades

- **`POST /students`**: Cria um novo estudante. Requer autenticação e acesso de administrador. Campos necessários: *userId*, *firstName*, *lastName*, e *courses* (opcional).

- **`GET /students/list`**: Lista todos os estudantes com suporte a paginação. Parâmetros opcionais: *limit* (número de itens por página) e *page* (número da página). Apenas usuário autenticados.

- **`GET /students/:enrollmentNumber`**: Obtém os detalhes de um estudante pelo *enrollmentNumber*. Requer autenticação. Apenas usuário autenticados.

- **`PUT /students/:enrollmentNumber`**: Atualiza as informações de um estudante pelo *enrollmentNumber*. Apenas administradores ou o próprio estudante podem atualizar.

- **`DELETE /students/:enrollmentNumber`**: Remove um estudante pelo *enrollmentNumber*. Apenas administradores podem realizar esta operação.

### Modelos

O modelo de estudante (`Student`) inclui os seguintes campos:

- **`userId`**: ID do usuário associado (obrigatório).
- **`firstName`**: Primeiro nome do estudante (obrigatório).
- **`lastName`**: Sobrenome do estudante (obrigatório).
- **`enrollmentNumber`**: Número de matrícula do estudante (obrigatório e único).
- **`courses`**: Lista de IDs de cursos associados (opcional).

### Exemplos de Resposta

#### Criação de Estudante

**Request:**
```http
POST /students
Content-Type: application/json
Authorization: Bearer <token>

{
    "userId": "60d5f4f0e5b7c4a568d8c1a3",
    "firstName": "João",
    "lastName": "Silva",
    "courses": ["60d5f4f0e5b7c4a568d8c1b4"]

}
```

# 🎓 Gerenciamento de Cursos

O gerenciamento de cursos oferece funcionalidades para criar, listar, atualizar e excluir cursos. Abaixo estão as principais operações suportadas:

### Rotas e Funcionalidades

- **`POST /courses`**: Cria um novo curso. Requer autenticação e acesso de administrador. Campos necessários: *title*, *department*, *professors* (opcional), *students* (opcional), e *capacity*.

- **`GET /courses/list`**: Lista todos os cursos com suporte a paginação. Parâmetros opcionais: *limit* (número de itens por página) e *page* (número da página). Acesso permitido para qualquer usuário.

- **`GET /courses/:id`**: Obtém os detalhes de um curso pelo *id*. Acesso permitido para qualquer usuário.

- **`PUT /courses/:id`**: Atualiza as informações de um curso pelo *id*. Apenas administradores podem atualizar.

- **`DELETE /courses/:id`**: Remove um curso pelo *id*. Apenas administradores podem realizar esta operação.

- **`GET /courses/summary/info-course`**: Obtém um resumo da distribuição de estudantes e a capacidade média dos cursos. Acesso permitido para qualquer usuário.

### Modelos

O modelo de curso (`Course`) inclui os seguintes campos:

- **`title`**: Título do curso (obrigatório e único).
- **`capacity`**: Capacidade do curso (obrigatório).
- **`department`**: Departamento ao qual o curso pertence (obrigatório).
- **`professors`**: Lista de IDs dos professores associados (opcional).
- **`students`**: Lista de IDs dos estudantes associados (opcional).

### Exemplos de Resposta

#### Criação de Curso

**Request:**
```http
POST /courses
Content-Type: application/json
Authorization: Bearer <token>

{
    "title": "Matemática Avançada",
    "department": "Matemática",
    "professors": ["60d5f4f0e5b7c4a568d8c1a1"],
    "students": ["60d5f4f0e5b7c4a568d8c1a2"],
    "capacity": 30
}
```

# 💬 Contato

Se você tiver dúvidas, sugestões ou precisar de ajuda com o projeto, sinta-se à vontade para entrar em contato. Aqui estão algumas formas de fazê-lo:

### Redes Sociais

- [E-mail](mailto:marjorymel48l@gmail.com)
- [LinkedIn](www.linkedin.com/in/marjorymell)

### GitHub Issues

Para relatar bugs ou solicitar novas funcionalidades, por favor, use a seção de [Issues](https://github.com/MarjoryMel/school-api/issues) do repositório no GitHub. Isso ajuda a manter um registro das questões e facilita a colaboração.

# :star: Obrigada!










