const User = require("../models/UserModel")
const Trans = require("../models/transModel")
var jwt = require("jsonwebtoken")
var bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

const login = async (req, res) => {


    try {

        const { email, password } = req.body
        if (!(email && password)) { res.status(400).send("email and password required") }

        const user = await User.findOne({ email });
        // console.log(user, password, await bcrypt.compare(password, user.password))

        if (!user) res.status(404).send("User not registered")

        const isMatched = await bcrypt.compare(password, user.password)

        if (!isMatched) return res.status(400).send({
            message: "email/password not valid"
        })

        //create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY)

        user.token = token
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

        const { email, password, first_name, last_name, balance } = req.body;

        if (!email || !password || !first_name || !last_name || !balance) res.send({ message: "missing parameter" })

        const doesExist = await User.findOne({ email })
        if (doesExist) res.status(409).send({ message: "This email is already registered" })

        encryptedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ first_name, last_name, email: email.toLowerCase(), password: encryptedPassword, balance })
        //create token
        const token = jwt.sign(
            {
                user_id: user._id
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: 60 * 10
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

        res.send({ message: res.user.first_name + " has been deactivated succesfully" })
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

        const newT = await Trans.create({
            account: res.user.first_name,
            debit: true,
            amount: money,
            desc: "Withdrawal",
            total
        })
        newT.save()

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
        if (money > res.user.balance) {
            res.send("Balance is lower than request")
        }
        res.user.balance = total
        res.user.save()

        const newT = await Trans.create({
            account: res.user.first_name,
            debit: true,
            amount: money,
            desc: "Withdrawal",
            total
        })

        newT.save()
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

const transfer = async (req, res) => {

    const money = parseInt(req.params.money)

    const senderId = req.params.sender;
    const receiverId = req.params.receiver

    const senderUser = await User.findById(senderId)
    const receiverUser = await User.findById(receiverId)

    const uniq = uuidv4()

    if (!(senderUser || receiverUser)) {
        res.status(404).send("Either the sender or the receiver was not found")
    }

    if (senderUser.disable == true) {
        res.send({ message: "This user account is disabled" })
    }

    if (senderUser.online == false) {
        res.send({ message: "Please log in to withdraw" })
    }

    try {
        const paramsSender = {
            transaction: uniq,
            debit: true,
            amount: money,
            account: receiverUser.email,
            desc: "Transaction",
            total: senderUser.balance - money
        }

        const paramsReceiver = {
            transaction: uniq,
            credit: true,
            amount: money,
            account: senderUser.email,
            desc: "Transaction",
            total: receiverUser.balance + money

        }
        senderUser.transactions.push(paramsSender)
        receiverUser.transactions.push(paramsReceiver)

        senderUser.balance -= money
        receiverUser.balance += money


        const newT = await Trans.create({
            transaction: uniq,
            account: senderUser.first_name,
            debit: true,
            sender: senderUser.first_name,
            receiver: receiverUser.first_name,
            amount: money,
            desc: "Transaction",
            total: senderUser.balance - money
        })

        newT.save()

        senderUser.save()
        receiverUser.save()
        //console.log(senderUser, receiverUser)

        await

            res.send("Transfer successful")



    } catch (err) {
        res.send({ message: err.message })
    }
}


const reverse = async (req, res) => {
    const id = req.params.id
    const TransNeede = await Trans.find({ transaction: id })
    //console.log(TransNeede[0])

    TransNeede[0].reversed = true






    const AllUser = await User.find()

    AllUser.forEach(u => {
        const matched = u.transactions
        //console.log(matched)

        matched.map(t => {
            if (t.transaction == id) {
                if (t.credit == true) {
                    t.credit = false

                    t.total = t.total - t.amount
                    u.balance = u.balance - t.amount
                }

                if (t.debit == true) {
                    t.debit = false

                    t.total = t.total + t.amount
                    u.balance = u.balance + t.amount
                }

                res.send("Reversed successfully")



            }
        })
    })



    AllUser.save()

    TransNeede[0].save()

    // const paramSenderRev = {
    //     transaction: id,
    //     credit: true,
    //     //account,
    //     amount: money,
    //     desc: "Transaction",
    //     total: receiverUser.balance + money

    // }

    // const paramReceiverRev = {
    //     transaction: id,
    //     debit: true,
    //     //account,
    //     amount: money,
    //     desc: "Transaction",
    //     total: receiverUser.balance + money

    // }

}


module.exports = {
    login,
    deposit,
    withdraw,
    transfer,
    allTransactions,
    register,
    deleteUser,
    disable,
    reverse,
    allUsers,
    getoneUser
}