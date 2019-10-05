/** Class representing the user
 *  @author Irina
 * */

'use strict';

export default class User {
    /**
     * Create a user and give him a random ID
     * @param {WebSocket} socket - the socket
     */
    constructor(socket){
        this.socket = socket;
        // creates a random id for the connection
        this.id = "1" + Math.floor(Math.random() * 1000000000)
    }
}