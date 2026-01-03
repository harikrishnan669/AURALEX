const https = require("https")
const fs = require("fs")
const next = require("next")

const app = next({ dev: true })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    https
        .createServer(
            {
                key: fs.readFileSync("./192.168.0.9+1-key.pem"),
                cert: fs.readFileSync("./192.168.0.9+1.pem"),
            },
            (req, res) => handle(req, res)
        )
        .listen(3000, () => {
            console.log("HTTPS running at https://192.168.0.9:3000")
        })
})
