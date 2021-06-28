const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    process.exit(1);
});

dotenv.config({ path: './config.env'});

const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('App connected to database successfully');
},err => {
    throw new Error(err);
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`The App is up on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! , Shutting down server');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});