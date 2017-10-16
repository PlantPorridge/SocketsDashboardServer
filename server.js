'use strict';

// let db
// const dbconnection = 'mongodb://user:pw@ds117965.mlab.com:17965/sockettestdb';
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({ extended: true }))

// MongoClient.connect(dbconnection, (err, database) => {
//     if (err) return console.log(err)
//     db = database
//     app.listen(3000, () => {
//         console.log('MONGODB listening on 3000')
//     })
// })

// function databaseStore(message) {
//     let storeData = { chatMessage: message, timestamp: new Date().getTime() }
//     db.collection('chatroom-chats').save(storeData, (err, result) => {
//         if (err) return console.log(err)
//         console.log('saved to database')
//     })
// }

let userWalk = 0;
let messages = [];

io.on('connection', (socket) => {

    console.log('user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    
    socket.on('increment-walk', (message) => {
        userWalk++;
        io.emit('user-walk-value', { type: 'value', value: userWalk });
    });

    socket.on('decrement-walk', (message) => {
        userWalk--;
        io.emit('user-walk-value', { type: 'value', value: userWalk });
    });

    socket.on('get-message-history', (numOfValues = 5) => {
        let historySlice = messages.slice(Math.max(0, messages.length - numOfValues), messages.length);
        historySlice.forEach(message => {
            io.emit('quick-chat-message', { type: 'value', value: message });
        });    
    });

    socket.on('add-message', (message) => {
        messages.push(message);
        io.emit('quick-chat-message', { type: 'value', value: message });
        // Function above that stores the message in the database
        // databaseStore(message)
    });

});



http.listen(5000, () => {
    console.log('Server started on port 5000');
});

randomWalk();
trigomicFunction();

function randomWalk(min = -10, max = 10) {

    let value = 0;
    setInterval(function () {
        io.clients((err, clients) => {
            if (err) throw (err);

            if (clients.length > 0) {
                let up = value <= min ? true : value >= max ? false : Math.random() < 0.5;
                value += up ? 1 : -1;

                let newValue = { type: 'value', value: value };

                io.emit('walk-value', newValue);
            } else {
                // console.log("No active clients");
            }
        });
    }, 100);
}

function trigomicFunction() {

    let radians = -Math.PI;

    setInterval(function () {
        io.clients((err, clients) => {
            if (err) throw (err);

            if (clients.length > 0) {
                radians += 0.1;

                if (radians > Math.PI) {
                    radians = -Math.PI;
                }

                let sineValue = Math.sin(radians);
                let cosineValue = Math.cos(radians);
                let tangentValue = Math.tan(radians);

                io.emit('sine-value', { type: 'value', value: sineValue });
                io.emit('cosine-value', { type: 'value', value: cosineValue });
                io.emit('tangent-value', { type: 'value', value: tangentValue > 10 || tangentValue < -10 ? null : tangentValue });              
                
            } else {
                // console.log("No active clients");
            }
        });
    }, 100);
}