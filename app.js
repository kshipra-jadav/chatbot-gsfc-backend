const express = require("express")
const dialogflow = require("@google-cloud/dialogflow")
const uuid = require("uuid")
const path = require("path")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 3000
const dotenv = require("dotenv")
dotenv.config()

const sessionId = uuid.v4()
const projectId = process.env.projectId
const credentials = {
	private_key: process.env.privateKey,
	client_email: process.env.clientEmail,
}

const sessionClient = new dialogflow.SessionsClient({ projectId, credentials })

app.listen(port, () =>
	console.log(`GSFC Chatbot Backend Running On :- ${port}!`),
)
const root = path.join("__dirname", "public")

app.use(express.static("public"))
app.use(express.json())
app.use(
	express.urlencoded({
		extended: true,
	}),
)
app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "public"))
app.use(cors())

app.get("/", (req, res) => {
	let data = {
		query: " ",
		answer: " ",
	}
	res.sendFile(__dirname + "/public/first.html")
})

app.post("/hey", (req, res) => {
	console.log("req come")
	console.log(req.body)
	res.send("hey thhere")
})

app.post("/get-bot-ans", async (req, res) => {
	let query = req.body.query

	let answer = await getQueryAnswer(query, sessionId)

	let data = {
		query: query,
		answer: answer[0].queryResult.fulfillmentText,
	}

	res.json({
		msg: "success",
		data: data,
	})
})

let getQueryAnswer = async (query, sessionId) => {
	const sessionPath = sessionClient.projectAgentSessionPath(
		projectId,
		sessionId,
	)

	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text: query,

				languageCode: "en-US",
			},
		},
	}

	const responses = await sessionClient.detectIntent(request)

	return responses
}
