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
        console.log("A new connection was established. " + user.id + " has joined the game. " +
            "Total connections: " + room1.users.length);
    }
});

console.log("WebSocket server is running.");
console.log("Listening to port " + port + ".");