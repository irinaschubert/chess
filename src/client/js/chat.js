/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Chat {
    constructor() {
        this.appendToHistory = this.appendToHistory.bind(this);
    }

    appendToHistory(sender, message) {
        $("#chat-history").append("<li>" + sender + ": " + message + "</li>");
    }
}

