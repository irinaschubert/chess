/** representing the server
 *  @author Irina
 *
 *  @todo make es6 class from it
 * */

'use strict';

import User from './game/user.js';
import GameRoom from './game/gameRoom.js';
import {MongoClient} from "mongodb";
let WebSocketServer = require('ws').Server;
let url = "mongodb://localhost:27017/";

let room1 = new GameRoom();
let room2 = new GameRoom();
let room3 = new GameRoom();
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
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");
            let gameRoomUser = { gameRoomId: room1.id, user: user.id };
            dbo.collection("rooms").insertOne(gameRoomUser, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room 1: " + room1.users.length);
    }
    else if(room2.users.length < 2){
        let user = new User(socket);
        room2.addUser(user);
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");
            let gameRoomUser = { gameRoomId: room2.id, user: user.id };
            dbo.collection("rooms").insertOne(gameRoomUser, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room 2: " + room2.users.length);
    }
    else if(room3.users.length < 2 ){
        let user = new User(socket);
        room3.addUser(user);
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");
            let gameRoomUser = { gameRoomId: room3.id, user: user.id };
            dbo.collection("rooms").insertOne(gameRoomUser, function(err, res) {
                if (err) throw err;
                db.close();
            });
        });
        console.log("[Server] A new connection was established. " + user.id + " has joined the game. " +
            "Total connections in room 3: " + room3.users.length);
    }
});

console.log("[Server] WebSocket server is running.");
console.log("[Server] Listening to port " + port + ".");