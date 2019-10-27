/** representing the server
 *  @author Irina
 *
 *  @todo make es6 class from it
 * */

'use strict';

import User from './game/user.js';
import GameRoom from './game/gameRoom.js';
let WebSocketServer = require('ws').Server;

let room1 = new GameRoom();
let room2 = new GameRoom();
let port = 8000;
let server = new WebSocketServer({port:port});

/**
 * Establish a connection and add users to room
 * @param {WebSocket} socket
 */
// Is executed when a new socket connects to the server. Adds user only up until 2 users.
server.on('connection', function(socket){
    if(room1.users.length < 2){
        let user = new User(socket);
        room1.addUser(user);
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room 1: " + room1.users.length);
    }
    else if(room1.users.length >= 2 && room1.users.length < 5){
        let user = new User(socket);
        room2.addUser(user);
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room 2: " + room2.users.length);
    }
});

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");