const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    //since we don't want user to change the role
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    //new =true for returning the updated object

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true //we want mongoose to valid document like valid email ids
    });

    //testing
    // const user = await User.findById(req.user.id);
    // user.name = 'Jonas';
    // await user.save();

    // the above 3 lines will give error because .save() runs through validators and passwordconfirm is a required field so since now we are not dealing with sensitive data we can use the update also which will not run validators


    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defned'
    })
}
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defned'
    })
}
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defned'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defned'
    })
}
