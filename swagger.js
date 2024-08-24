const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'School API',
    description: 'Teste',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  tags: [
    { name: 'Courses', description: 'Course-related operations', url: 'localhost:3000/api/course' }, // Course Routes
    { name: 'Installation', description: 'Installation of data in the database' }, //InstallRoutes
    { name: 'Professors', description: 'Teacher-related operations' },
    { name: 'Students', description: 'Student-related operations' },
    { name: 'Users', description: 'User-related operations' },
  ],
  definitions: {},
};

const outputFile = './swagger_output.json';
const endpointsFiles = [
  './routes/courseRoutes.js',
  './routes/installRoutes.js',
  './routes/professorRoutes.js',
  './routes/studentRoutes.js',
  './routes/userRoutes.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated.');
});
