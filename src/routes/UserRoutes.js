const router = require("express").Router()
const User = require("../models/UserModel")

const { login,
    deposit,
    withdraw,
    transfer,
    allTransactions,
    register,
    deleteUser,
    reverse,
    disable,
    allUsers,
    getoneUser,
    transactions
} = require("../controllers/userController")


module.exports = () => {

    // 1) User can LOGIN thru email and password
    router.post("/login", login)
    // 2) User can DEPOSIT
    router.post("/:id/deposit/:money", getUserId, deposit)
    // 3) User can WITHDRAW
    router.post("/:id/withdraw/:money", getUserId, withdraw)
    // 4) User can TRANSFER to another User
    router.post("/:sender/transfer/:receiver/:money", transfer)
    // 5) User can see all their TRANSACTIONS
    router.post("/:id/transactions", getUserId, allTransactions)

    router.get("/transactions", transactions)
    //////////////////////////////////////////////////////////

    // 6) Admin can REGISTER user
    router.post("/register", register)
    // 7) Admin can DELETE user
    router.delete("/:id", getUserId, deleteUser)
    // 8) Admin can REVERSE transactions (id is the id of the traansaction and not the user)
    router.post("/reverse/:id", reverse)
    // 9) Admin can DISABLE a user
    router.get("/:id/disable", getUserId, disable)

    ///////////////////////////////////////////////////////////////7

    // to get all users
    router.get("/users", allUsers)
    //to get 1 user
    router.get("/:id/", getUserId, getoneUser)

    // to find ID
    async function getUserId(req, res, next) {
        let user;
        try {
            user = await User.findById(req.params.id)
            if (user == null) {
                return res.status(404).send("Cannot find user")
            }
        } catch (err) {
            return res.status(500).send({ message: err.message })
        }

        res.user = user
        next()
    }

    return router
}