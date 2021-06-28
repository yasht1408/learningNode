const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is mandatory'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter the password'],
        minlength: 8,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm tour password'],
        validate: {
            validator: function(val) {
                return this.password === val;
            },
            message: 'both the password does not match each other, Please try again!!!!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordExpiresIn: Date,
    role: {
        type: String,
        default: 'user'
    }
});

//Bcrypting the password
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return next();
    
    //hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password,12);

    // Deleting the conform password field 
    this.passwordConfirm = undefined;
});

userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    console.log('inside compare function');
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log('changedTiemstamp',changedTimeStamp);
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;