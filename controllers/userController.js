const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.getUser = (req,res) => {
    res.status(200).json({
        status: 200,
        message: 'Here are all the users'
    });
};

exports.getUserById = (req,res) => {
    res.status(200).json({
        status: 200,
        message: `user with id ${req.params.id} is here`
    });
}

exports.createUser = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).json({
        status: 200,
        message: 'New user created',
        data: {
            user
        }
    });
});

exports.updateUser = (req,res) => {
    res.status(200).json({
        status: 200,
        message: `The user with id ${req.params.id} have been updated`
    });
};

exports.deleteUser = (req,res) => {
    res.status(200).json({
        status: 200,
        message: `User with id ${req.params.id} have been deleted`
    });
};