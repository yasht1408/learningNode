const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//middleware
app.use(express.json());  //middleware to get the req body

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use((req,res,next) => {
    console.log("Hello from the middleware");
    next();
});

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling route for a route that is not defined
app.all('*', (req, res, next) =>{
    next(new AppError(`route is not defined for ${req.originalUrl}, on this server`,404));
});

app.use(globalErrorHandler);

//exporting thr app variable
module.exports = app;
