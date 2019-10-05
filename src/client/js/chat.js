/** Class representing the chat
 *  @author Irina
 * */

'use strict';

export default class Chat {
    /**
     * Bind methods
     */
    constructor() {
        this.appendToHistory = this.appendToHistory.bind(this);
    }

    /**
     * Appends a message to the message history
     * @param {String} sender - sender's ID
     * @param {String} message - message to append
     */
    appendToHistory(sender, message) {
        $("#chat-history").append("<li>" + sender + ": " + message + "</li>");
    }
}

