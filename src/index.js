
require("dotenv").config()
const express = require("express")
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")

const app = express()
app.use(express.urlencoded({ extended: true }))

let sock
let currentPairCode = null
let isConnected = false

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "open") {
            isConnected = true
            currentPairCode = null
            console.log("Bot Connected")
        }
        if (connection === "close") {
            isConnected = false
            console.log("Bot Disconnected")
        }
    })
}

app.get("/", (req, res) => {
    res.send(`
    <html>
    <body style="background:#0f0f0f;color:#00ff88;font-family:sans-serif;text-align:center;padding-top:50px;">
        <h1>XHYPER MD V15 Phase 2</h1>
        <p>Status: ${isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
        <form method="POST" action="/pair">
            <input name="phone" placeholder="947XXXXXXXXX" style="padding:10px;border-radius:5px;border:none"/>
            <br><br>
            <button style="padding:10px 20px;background:#00ff88;border:none;border-radius:5px;">Generate Pair Code</button>
        </form>
        <h2>${currentPairCode ? "Pair Code: " + currentPairCode : ""}</h2>
    </body>
    </html>
    `)
})

app.post("/pair", async (req, res) => {
    const phone = req.body.phone
    if (phone !== process.env.OWNER_NUMBER) {
        return res.send("Not Authorized")
    }

    if (!sock) await startBot()

    const code = await sock.requestPairingCode(phone)
    currentPairCode = code

    res.redirect("/")
})

app.listen(process.env.PORT || 3000, () => {
    console.log("XHYPER MD Phase 2 Running")
})
