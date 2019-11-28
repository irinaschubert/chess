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
        this.loadGame = this.loadGame.bind(this);
    }

    /**
     * Appends saved games
     */
    appendToGames(gameTimestamp, gameBoard) {
        let savedGames = this;
        let listElement = document.createElement('li');
        listElement.innerHTML = gameTimestamp;
        $("#saved-games").append(listElement);
        listElement.addEventListener('click', function(){
            savedGames.loadGame(gameBoard);
        });


    }

    loadGame(gameBoard) {
        $("#board").empty();
        $("#board").append(gameBoard);
        $("#show-saved-games").addClass("hide");
    }

}

