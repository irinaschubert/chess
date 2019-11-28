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

let room1 = new GameRoom();
let port = 8000;
let server = new WebSocketServer({port:port});

/**
 * Establish a connection and add users to room
 * @param {WebSocket} socket
 */
// Is executed when a new socket connects to the server. Adds user up to 2 users then makes a new room.
server.on('connection', function(socket, client){
    addUserToRoom(room1, socket);
});

function addUserToRoom(room, socket){
    if(room.users.length < 2){
        let user = new User(socket);
        room.addUser(user);
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");
            let gameRoomUser = { gameRoomId: room.id, user: user.id };
            dbo.collection("rooms").insertOne(gameRoomUser, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room " + room.id + ": " + room.users.length);
    }
    else {
        room1 = new GameRoom();
        addUserToRoom(room1, socket);
    }
}

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");