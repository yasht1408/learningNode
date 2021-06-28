const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const { runInNewContext } = require('vm');

const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1 check if email and password exists
    if (!email || !password) return next(new AppError('please enter email and password', 400));
    //2 check is user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Email or password is incorrect',401));
    }
    //3 if everything is ok send the token to client
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    //1.getting the token and check if it is there
    let token;
    console.log(req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    console.log('token is ',token);
    
    if (!token) {
        return next(new AppError('You are not logged in!!. Please login to get the access',401));
    }
    //2.verification of token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('Decoded is ', decoded);
    //3.Checking if user still exists
    const currentUser = await User.findById(decoded.id);
    console.log('current user is ', currentUser);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exists',401));
    }
    //4.check if user changed the password afetr the token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('You recently change password. Please login again!!!!',401));
    }
    
    //Grant access to the user 
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles[admin,lead-guide]
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You does not have sufficient previlages to perfoem this operation',403));
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //await user.save({ validateBeforeSave: false });
  
});