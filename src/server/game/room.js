/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

const CHAT_MESSAGE = 1;
const GAME_LOGIC = 2;
const WAITING_TO_START = 0;
const GAME_START = 1;
const GAME_OVER = 2;
const GAME_RESTART = 3;

export default class Room {
    constructor(){
        this.users = [];
    }

    addUser(user) {
        this.users.push(user);
        let room = this;

        let data = {
            dataType : CHAT_MESSAGE,
            sender : "Server",
            message: user.id + " has joined the game. Total connections: " + this.users.length
        };

        room.sendAll(JSON.stringify(data));

        user.socket.onclose = function () {
            console.log(user.id + ' left.');
            room.removeUser(user);
        };

        this.handleOnUserMessage(user);
    };

    removeUser(user) {
        for (let i = this.users.length; i >= 0; i--) {
            if (this.users[i] === user) {
                this.users.splice(i, 1);
            }
        }
    };

    sendAll(message) {
        for (let i = 0, len = this.users.length; i < len; i++) {
            this.users[i].socket.send(message);
        }
    };

    handleOnUserMessage(user){
        let room = this;
        user.socket.on("message", function (message) {
            console.log("Receive message from " + user.id + ": " + message);

            let data = JSON.parse(message);
            if(data.dataType === CHAT_MESSAGE){
                data.sender = user.id;
            }
            room.sendAll(JSON.stringify(data));
        });
    }
}