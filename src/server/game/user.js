/** Class representing the user
 *  @author Irina
 * */

'use strict';

export default class User {
    /**
     * Create a user and give him a random id, username is set later
     * @param {WebSocket} socket - the socket
     */
    constructor(socket){
        this.socketId = "1" + Math.floor(Math.random() * 1000000000);
        this.socket = socket;
        this.username = "";
    }

    setUsername(username){
        this.username = username;
    }
}