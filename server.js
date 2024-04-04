export {swaggerDocs};
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import routing from './routing.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


const app = express();

// Swagger setup

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API',
            version: '1.0.0',
            description: 'API for the project',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routing.js'],
};
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
};

// Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET|| 'secret_key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        maxAge: 360000, // 6 mins
        //secure: true, breaks stuff, so guess we won't have it secure :shrug:
        httpOnly: true
    }
}));

app.use(express.json({limit: '10mb'}));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());


app.listen(PORT, () => {
    routing(app);
    console.log(`Server is running on http://localhost:${PORT}`)
});
