/** representing the server, adds up to two users to a game room
 *  @author Irina
 *
 * */

'use strict';

import User from './game/user.js';
import GameRoom from './game/gameRoom.js';
import {MongoClient} from "mongodb";

let WebSocketServer = require('ws').Server;
let url = "mongodb://localhost:27017/";
let room = new GameRoom();
let port = 8000;
let server = new WebSocketServer({port:port});

/**
 * Establish a connection and add users to room
 * @param {WebSocket} socket
 */
// Is executed when a new socket connects to the server. Adds user up to 2 users then makes a new room.
server.on('connection', function(socket, client){
    addUserToRoom(room, socket);
});

function addUserToRoom(rooms, socket){
    let user = new User(socket);
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
        if (err) throw err;
        let dbo = db.db("webEchessDb");
        let userSocket = { socketId: user.socketId, socket: user.socket };
        dbo.collection("sockets").insertOne(userSocket, function(err, res) {
            if (err) throw err;
            db.close();
        });
    });
    room.addUser(user);
}

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");