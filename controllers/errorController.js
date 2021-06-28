const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again!!', 401);
}

const handleJWTExpiredError = () => new AppError('Your token has been expired. Please login Again!!!', 401);

const sendErrorProd = (err, res) => {
    //If error is operational error i.e. trusted error send error message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    //If error is not operational i.e. some Database or conenction error occured 
    else{
        console.log('ERROR', err);
        res.status(500).json({
            status: 'error',
            message: 'something wemt wrong'
        });
    }
}

const sendErrorDev = (err, res) => {
    console.log('SendErrorDevCalled');
    console.log(err.message);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }

    if (process.env.NODE_ENV === 'production') {
       let error = {...err};

       if (error.name === 'CastError') error = handleCastErrorDB(error);
       if (error.code === 11000) error = handleDuplicateFieldsDB(error);
       if (error.name === 'ValidationError')
         error = handleValidationErrorDB(error);
       if (error.name === 'invalid signature') error = handleJWTError();
       if (error.name === 'TokenExpiration') error = handleJWTExpiredError();

       sendErrorProd(err, res);  
    }
    next();
}