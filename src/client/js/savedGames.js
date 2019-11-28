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
        SavedGames.loadGame = SavedGames.loadGame.bind(this);
    }

    /**
     * Appends saved games
     */
    appendToGames(roomId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory) {
        let savedGames = this;
        let listElement = document.createElement('li');
        listElement.innerHTML = gameTimestamp;
        $("#saved-games").append(listElement);
        listElement.addEventListener('click', function(){
            SavedGames.loadGame(roomId, gameBoard, gameFieldsCaptured, gameChatHistory);
        });


    }

    static loadGame(roomId, gameBoard, gameFieldsCaptured, gameChatHistory) {
        $("#board").empty();
        $("#board").append(gameBoard);
        $("#field-captured").empty();
        $("#field-captured").append(gameFieldsCaptured);
        $("#chat-history").empty();
        $("#chat-history").append(gameChatHistory);
        $("#show-saved-games").addClass("hide");
    }

}

