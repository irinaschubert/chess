/** representing the server, adds up to two users to a game room
 *  @author Irina
 *
 * */

'use strict';

import User from './game/user.js';
import GameRoom from './game/gameRoom.js';

let WebSocketServer = require('ws').Server;
let room = new GameRoom();
let port = 8000;
let server = new WebSocketServer({port:port});

/**
 * Establish a connection and add users to game room
 * @param {WebSocket} socket
 */
// Is executed when a new socket connects to the server.
server.on('connection', function(socket, client){
    addUserToRoom(room, socket);
});

function addUserToRoom(rooms, socket){
    let user = new User(socket);
    room.addUser(user);
}

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");