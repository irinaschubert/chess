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

let rooms = [];
let room1 = new GameRoom();
rooms.push(room1);
let port = 8000;
let server = new WebSocketServer({port:port});

/**
 * Establish a connection and add users to room
 * @param {WebSocket} socket
 */
// Is executed when a new socket connects to the server. Adds user up to 2 users then makes a new room.
server.on('connection', function(socket, client){
    addUserToRoom(rooms, socket);
});

function addUserToRoom(rooms, socket){
    let i = rooms.length;
    let lastRoom = rooms[i - 1];
    if(lastRoom.users.length < 2){
        let user = new User(socket);
        lastRoom.addUser(user);
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");
            let gameRoomUser = { gameRoomId: lastRoom.id, user: user.id, socket: user.socket };
            dbo.collection("rooms").insertOne(gameRoomUser, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room " + lastRoom.id + ": " + lastRoom.users.length);
        if(lastRoom.users.length === 2){
            lastRoom = new GameRoom();
        }
    }
    else {
        //let room = new GameRoom();
        rooms.push(lastRoom);
        addUserToRoom(rooms, socket);
    }
}

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");