import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";  // tokens
import bcrypt from "bcrypt";     // password



const userSchema = new Schema ({
    username : {
        type : String,
        require : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
    },
    email : {
        type : String,
        require : [true, "email is required"],
        unique  : true,
        lowercase : true,
        trim : true,
        validate: {
            validator: function(value) {
                // Basic email pattern to check for valid format
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [32, 'Password must be at most 32 characters'],
        validate: {
            validator: function(value) {
                // Password must have at least one uppercase letter, one lowercase letter, one digit, and one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/.test(value);
            },
            message: 'Password must contain at least one uppercase, lowercase letters, one number & one special character',
        }
    },
    fullName : {
        type : String,
        require : true,
        trim : true,
        index : true
    },
    avatar : {
        type: String,                   // cloudinary url
        required: true,
    },
    coverImage : {
        type: String,                   // cloudinary url
    },
    watchHistory : [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken : {
        type : String,
    }
}, {timestamps : true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare("password", this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){}

export const User = mongoose.model("User", userSchema)