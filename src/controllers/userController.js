const User = require("../models/UserModel")
var jwt = require("jsonwebtoken")
var bcrypt = require("bcryptjs")

const login = async (req, res) => {

    // const firstParameter = req.params.first
    // const matchingUsername = await User.find({ username: firstParameter })
    // const matchingemail = await User.find({ email: firstParameter })

    // console.log(matchingUsername)

    // if (!matchingUsername || !matchingemail) {
    //     res.send({ message: "Username or email not found. Try again" })
    // }

    // try {
    //     //res.user.online = true
    //     //res.user.save()

    //     res.send({
    //         message: "Logged in"
    //     })



    try {

        const { email, password } = req.body
        if (!(email && password)) { res.status(400).send("email and password required") }

        const user = await User.findOne({ email });
        // console.log(user, password, await bcrypt.compare(password, user.password))

        if (!user) res.status(404).send("User not registered")

        const isMatched = await bcrypt.compare(password, user.password)

        if (!isMatched) res.send({
            message: "email/password not valid"
        })
        // {
        //     //create token
        //     const token = jwt.sign(
        //         { user_id: user._id, email },
        //         process.env.TOKEN_KEY,
        //         {
        //             expiresIn: "2h",
        //         }
        //     )
        //     user.token = token
        user.online = true
        user.save()
        res.status(200).send(user)

    }
    // res.status(400).send("Invalid Credentials")

    catch (err) {
        res.status(400).send({ message: err.message })
    }
}


const register = async (req, res, next) => {
    try {

        const { email, password, username, balance } = req.body;

        if (!email || !password || !username || !balance) res.send({ message: "missing parameter" })

        const doesExist = await User.findOne({ email })
        if (doesExist) res.status(409).send({ message: "This email is already registered" })

        encryptedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ username, email: email.toLowerCase(), password: encryptedPassword, balance })
        //create token
        const token = jwt.sign(
            {
                user_id: user._id,
                email: user.email
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h"
            }
        )



        user.token = token
        const savedUser = await user.save()


        //console.log(token)

        res.status(201).send(savedUser)
    } catch (err) {
        res.send({ message: err.message })
    }

}

const allUsers = async (req, res) => {
    //console.log("all Users")
    const allUsers = await User.find()
    res.send(allUsers)
}

const getoneUser = (req, res) => {
    //console.log("one user")
    res.send(res.user)
}

const deleteUser = async (req, res) => {
    try {// why is the res.user.remove() a promise?////////////////
        await res.user.remove()
        res.send({ message: "User deleted successfully" })
    } catch (err) {
        res.status(500).send({ message: err.message })
    }


}

const disable = async (req, res) => {
    try {
        res.user.disable = true
        res.user.online = false
        res.user.save()

        res.send({ message: res.user.username + " has been deactivated succesfully" })
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}

const deposit = async (req, res) => {
    const money = parseInt(req.params.money)

    if (res.user.disable == true) {
        res.send({ message: "This account is disabled therefore cannot send or receive any money" })
    }

    if (res.user.online == false) {
        res.send({ message: "Please log in to deposit" })
    }

    const total = res.user.balance + money;
    try {

        const transArray = res.user.transactions
        const params = {
            credit: true,
            amount: money,
            desc: "Deposit",
            total
        }

        transArray.push(params)
        res.user.balance = total
        res.user.save()


        res.send({ message: money + "Deposited successfully" })
    } catch (err) {
        res.status(500).send({ message: "Unable to deposit " })
    }

}

const withdraw = async (req, res) => {
    const money = parseInt(req.params.money)

    if (res.user.disable == true) {
        res.send({ message: "This account is disabled therefore cannot receive or send monyey" })
    }

    if (res.user.online == false) {
        res.send({ message: "Please log in to withdraw" })
    }

    const total = res.user.balance - money;
    //console.log(res.user.)

    try {
        const transArray = res.user.transactions
        const params = {
            debit: true,
            amount: money,
            desc: "Withdrawal",
            total
        }
        transArray.push(params)
        res.user.balance = total
        res.user.save()


        res.send({ message: money + "Withdrawn successfully" })
    } catch (err) {
        res.status(500).send({ message: "Unable to withdraw " })
    }

}





const allTransactions = async (req, res) => {
    console.log(res.user)
    try {

        if (res.user.disable == true) {
            res.send({ message: "This user is disabled" })
        }

        if (res.user.online == false) {
            res.send({ message: "This user is not logged in" })
        }

        res.send(res.user.transactions)


    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}






module.exports = {
    login,
    deposit,
    withdraw,
    allTransactions,
    register,
    deleteUser,
    disable,
    allUsers,
    getoneUser
}