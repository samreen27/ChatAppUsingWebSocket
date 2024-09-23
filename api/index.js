const express = require('express')
const app = express()
require('dotenv').config()
const dbConnect = require('./dbConnect/dbConnect')
const cors = require('cors')
const router = require('./routes/routes.js')
const cookieParser = require('cookie-parser')
const Message = require('./model/Message.js')
const ws = require('ws')
const jwt = require('jsonwebtoken')

const port = 4000


// Use CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
}));

// Middleware to parse JSON bodies
app.use(express.json())

//to parse cookie
app.use(cookieParser())

app.use('/', router)

app.get('/test', (req, res) => {
    res.json('test Ok')
})



const start = async () => {
    try {

        await dbConnect(process.env.MONGODB_URI)
        const server = app.listen(port, console.log(`server is listening on port ${port}...`))
        const wss = new ws.WebSocketServer({server})

        wss.on('connection', (connection, req) => { 
            //console.log('connected')
            //to show who all are online in chat.jsx contacts portion(left-side)
            //wss.clients // this will show all client connections that are active only and wont have t the username/ user details
            //to show the userdetails, get the token from cookies and get the userdata from it
            //console.log(req.headers)
            
            //read username and id from the cookie for this connection
            const cookies = req.headers.cookie
            if(cookies){
                //there can be more than one cookie separated by ;
                const tokenCookieString = cookies.split(';').find(ele => ele.startsWith('token='))
                
                if(tokenCookieString){
                    const token = tokenCookieString.split('=')[1]
                    if(token){
                        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData)=>{
                            if(err) throw err;
                            const {userId, username} = userData;
                            connection.userId = userId
                            connection.username = username
                        })
                    }
                }
            }

            connection.on('message', async (message)=>{
                //message comes as buffer
               // console.log(message.toString())
                const messageData = JSON.parse(message.toString());
                const {recipient, text} = messageData


                if(recipient && text) {
                    const messageDoc = await Message.create({
                        sender: connection.userId,
                        recipient, 
                        text
                    });
                    [...wss.clients]
                    .filter(c => c.userId === recipient)
                    .forEach(c =>c.send(JSON.stringify({
                        text,
                        sender: connection.userId,
                        _id: messageDoc._id
                    })))

                }
            });

            
            //connection.send('hello')
            // console.log([...wss.clients].length);
            //notify everyone about the online people when someone connects
            [...wss.clients].forEach(client => {
                client.send(JSON.stringify(
                    {online: [...wss.clients].map(c => ({userId:c.userId, username: c.username}))}
                ))
            })
            
        })


    } catch (error) {
        console.log(error)
    }
}
start()



