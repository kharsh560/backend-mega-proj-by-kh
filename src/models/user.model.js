// L10, 6:30 Chai Code Backend
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // In JavaScript, trim() is a string method that removes whitespace from both ends of a string (including spaces, tabs, and newlines).
      // It does not affect the whitespace within the string.
      index: true,
      // "index" is used to make any field searchable. Selectively used, because its expensive affair.
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
      // cloudinary URL
    },
    coverImage: {
      type: String,
      // cloudinary URL
    },
    password: {
      // 13:09 min, L10: Password field needs encryption!!!
      type: String,
      required: [true, "Password is a required field!"],
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// 29:30 L10) Code for using bcrypt for encryption
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

// 34:09 L10) Making custom methods: Making method to compare and check the password.
userSchema.methods.isPasswordCorrect = async function (incomingPassword) {
    return await bcrypt.compare(incomingPassword, this.password);
}

// 43 min L10) Making method to generate JWT tokens (access and refresh)
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            // Payload: Info which this token has to store.
            _id : this._id,
            email : this.email,
            userName : this.userName,
            fullName : this.fullName,
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}
// 47:10 L10
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      // Payload: Info which this token has to store.
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema)