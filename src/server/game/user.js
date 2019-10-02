/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class User {
    constructor(socket){
        this.socket = socket;
        // creates a random id for the connection
        this.id = "1" + Math.floor(Math.random() * 1000000000)
    }
}