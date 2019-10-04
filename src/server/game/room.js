/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

const CHAT_MESSAGE = 1;

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
        let room = this;
        for (let i = this.users.length; i >= 0; i--) {
            if (this.users[i] === user) {
                this.users.splice(i, 1);
            }
        }
        let data = {
            dataType : CHAT_MESSAGE,
            sender : "Server",
            message: user.id + " has left the game. Total connections: " + this.users.length
        };
        room.sendAll(JSON.stringify(data));
    };

    sendAll(message) {
        for (let i = 0, len = this.users.length; i < len; i++) {
            this.users[i].socket.send(message);
        }
    };

    handleOnUserMessage(user){
    }
}