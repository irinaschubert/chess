/** Class representing the room and handles users and messages
 *  @author Irina
 *  @abstract
 * */

'use strict';

export default class Room {
    /**
     * Abstract, create a Room with an array of users
     */
    constructor(){
        this.users = [];
    }

    /**
     * Adds a user to the room, notify all users
     * @param  {User} user - user to add
     */
    addUser(user) {
        this.users.push(user);
        let room = this;

        user.socket.onclose = function () {
            console.log(user.socketId + ' left.');
            room.removeUser(user);
        };

        this.handleOnUserMessage(user);
    };

    /**
     * Removes a user from the room
     * @param  {User} user - user to remove
     */
    removeUser(user) {
        let username = user.username;
        let userCheck = [];
        for (let i = this.users.length; i >= 0; i--) {
            if (this.users[i] === user) {
                this.users.splice(i, 1);
            }
        }
        for(let i in this.users){
            if(this.users[i].username === username){
                userCheck.push(1);
            }
        }

        if(userCheck.length < 1){
            this.logOutUser(user);
        }
    };

    logOutUser(user){

    }

    /**
     * Sends a message to all users
     * @param  {String} message - message to send
     */
    sendAll(message) {
        for (let i = 0, len = this.users.length; i < len; i++) {
            this.users[i].socket.send(message);
        }
    };

    handleOnUserMessage(user){
    }
}