/** Class representing the chat
 *  @author Irina
 * */

'use strict';

export default class Chat {
    /**
     * Bind method
     */
    constructor() {
        this.appendToHistory = this.appendToHistory.bind(this);
    }

    /**
     * Appends a message to the message history
     * @param {String} sender - sender's ID
     * @param {String} message - message to append
     */
    appendToHistory(sender, message, toAll) {
        let prefix;
        if(toAll){
            prefix = "[All] ";
        }
        else{
            prefix = "[Private] ";
        }
        if(sender === undefined){
            $("#chat-history").append("<li>" + prefix + message + "</li>");
        }
        else {
            $("#chat-history").append("<li>" + prefix + sender + ": " + message + "</li>");
        }

    }
}

