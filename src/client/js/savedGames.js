/** Class representing the chat
 *  @author Irina
 * */

'use strict';

export default class SavedGames {
    /**
     * Bind methods
     */
    constructor() {
        this.appendToGames = this.appendToGames.bind(this);
    }

    /**
     * Appends saved games
     */
    appendToGames(game) {
        $("#saved-games").append("<li>" + game + "</li>");
    }
}

