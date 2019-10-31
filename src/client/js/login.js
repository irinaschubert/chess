/** Class representing the chat
 *  @author Irina
 * */

'use strict';

export default class Login {
    /**
     * Bind methods
     */
    constructor() {
        this.logIn = this.logIn.bind(this);
    }

    /**
     * Appends a message to the message history
     * @param {String} sender - sender's ID
     * @param {String} message - message to append
     */
    getUsername() {
        $("#login-form").html();
    }
}