const UserRoutes = require("./UserRoutes")
module.exports = (router) => {
    router.use(UserRoutes())
    return router
}