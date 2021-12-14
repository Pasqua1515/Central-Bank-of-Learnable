const { Schema, model } = require("mongoose")
const bcrypt = require("bcrypt")

const reqString = {
    type: String,
    trim: true,
    required: true
}


const TransSchema = new Schema({
    credit: {
        type: Boolean
    },
    debit: {
        type: Boolean
    },
    amount: {
        type: Number,
        required: true
    },

    desc: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        trim: true,
        default: Date.now
    },
    total: {
        type: Number
    }
})


const UserSchema = new Schema({
    username: {
        type: String
    },
    password: {
        ...reqString
    },
    email: {
        ...reqString,
        unique: true
    },
    transactions: [TransSchema],
    balance: {
        type: Number,
        required: true,
        min: 0,
        max: 100000000
    },
    disable: {
        default: false
    },
    online: {
        default: false
    },
    token: {
        type: String
    }
})



// UserSchema.pre("save", async function (next) {
//     try {
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(this.password, salt)
//         this.password = hashedPassword
//         next()
//     } catch (err) {
//         next(err)
//     }
// })




const User = model("User", UserSchema)



module.exports = User