/**
 * Represents a websocket
 * @author: Irina
 *
 */

'use strict';

import Chat from './chat.js';
import GameControllerClass from "./gameControllerClass.js";

let websocketGame = {
    GAME_LOGIC : 0,
    CHAT_MESSAGE : 1,
    MOVE : 2,
    LOGIN : 3,
    REGISTRATION : 4,
    GAME_INIT : 1,
    GAME_START : 2,
    GAME_OVER : 3,
    RESTART : 40,
    REVANCHE : 5,
    NORMAL : 0,
    CHECK : 1,
    CHECKMATE : 2,
    REMIS : 3,
    PATT : 4,
    CAPITULATE : 5,
    isPlayerTurn: false,
    SAVE : 10,
    LOAD : 11,
    SHOW_GAMES: 12,
    LOAD_GAME:13,
    FAILURE : 0,
    SUCCESS : 1,
    WHITE : 1,
    BLACK : 0
};

let username = "";
const LOAD = 1;

$(function(){
    //check if browser supports websockets
    if(window["WebSocket"]){
        let chat = new Chat();
        let gc = new GameControllerClass();

        // create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

        // on open event
        websocketGame.socket.onopen = function(e){
            console.log('WebSocket connection established.');
        };

        // on message event (executed when receiving a message from GameRoom)
        websocketGame.socket.onmessage = function(e){

            let data = JSON.parse(e.data);

            if(data.dataType !== websocketGame.LOGIN && data.dataType !== websocketGame.SHOW_GAMES){
                console.log("Got message: ", e.data);
            }

            // login
            if(data.dataType === websocketGame.LOGIN){
                if(data.message === websocketGame.SUCCESS){
                    username = $("#username-input-login").val();
                    $("#login").addClass("hide");
                    $("#footer").removeClass("hide");
                    $("#username").append(data.username);
                    chat.appendToHistory(data.sender, data.username + " has joined the game");
                }
                else if(data.message === websocketGame.FAILURE){
                    let loginText = document.getElementById("login-text");
                    loginText.innerHTML = "Wrong username or password";
                    $("#pw-input-login").val("");
                }
            }

            // registration
            if(data.dataType === websocketGame.REGISTRATION){
                if(data.message === websocketGame.SUCCESS){
                    username = data.username;
                    $("#login").addClass("hide");
                    $("#footer").removeClass("hide");
                    $("#username").append(data.username);
                    chat.appendToHistory(data.sender, data.username + " has joined the game");
                }
                else if(data.message === websocketGame.FAILURE){
                    let loginText = document.getElementById("login-text");
                    loginText.innerHTML = "Username already exists";
                    $("#pw-input-login").val("");
                }
            }

            // show saved games
            else if (data.dataType === websocketGame.SHOW_GAMES){
                if(data.timestamps !== []){
                    $("#saved-games").empty();
                    for(let i = 0; i < data.timestamps.length; i++){
                        //savedGames.appendToGames(data.gameRoomId, data.timestamps[i], data.boards[i], data.fieldsCaptured[i], data.chatsHistory[i]);
                        appendToGames(data.gameRoomIds[i], data.timestamps[i], data.boards[i], data.fieldsCaptured[i], data.chatsHistory[i], data.turns[i], data.whitePlayers[i], data.isMyTurns[i], data.iAmWhites[i]);
                    }
                    $("#show-saved-games").removeClass("hide");
                }

            }

            // print on chat panel if it is a chat message
            if(data.dataType === websocketGame.CHAT_MESSAGE){
                chat.appendToHistory(data.sender, data.message);
            }

            // make move if it is a move
            else if (data.dataType === websocketGame.MOVE){
                // if it was not the players turn before, it is now the players turn
                if(websocketGame.isPlayerTurn === false){
                    // if it was not players turn, synchronize enemy's move
                    movePiece(data.from, data.to);
                    //save game after each move
                    //saveGame(username);
                    // enable move button
                    document.getElementById("move").disabled = false;
                }
                else{
                    //save game after each move
                    saveGame();
                    document.getElementById("move").disabled = true;
                }
            }

            // take action if it is a game logic message
            else if (data.dataType === websocketGame.GAME_LOGIC){

                if(data.gameState === websocketGame.GAME_OVER){
                    websocketGame.isPlayerTurn = false;
                    $("#show-turn").append(data.winner+" wins!");
                    $("#capitulate").show();
                }

                if(data.gameState === websocketGame.GAME_START){
                    $("#show-turn").html("");
                    let pieces = document.getElementsByClassName("piece");
                    for (let i = 0; i < pieces.length; ++i) {
                        pieces.item(i).classList.toggle('not-clickable');
                    }

                    if(data.isPlayerTurn){
                        websocketGame.isPlayerTurn = true;
                        $("#show-turn").append("Your turn to move.");
                    }
                    else{
                        websocketGame.isPlayerTurn = false;
                        $("#show-turn").append("Wait for your partner to move.");
                    }
                }

                if(data.gameState === websocketGame.GAME_INIT){
                    $("#show-turn").html("");

                    //behave differently if game is loaded
                    if(data.load === true){
                        if(data.iAmWhite){
                            if(data.isPlayerTurn){
                                websocketGame.isPlayerTurn = true;
                                $("#show-turn").append("Your turn to move.");
                                $('.white').each(function () {
                                    $(this).removeClass('not-clickable');

                                });
                                $('.black').each(function () {
                                    $(this).addClass('not-clickable');
                                });

                            }
                            else{
                                websocketGame.isPlayerTurn = false;
                                $("#show-turn").append("Wait for your partner to move.");
                                $('.white').each(function () {
                                    $(this).addClass('not-clickable');

                                });
                                $('.black').each(function () {
                                    $(this).addClass('not-clickable');
                                });
                            }
                            $('.white').each(function () {
                                $(this).removeClass('not-my-color');

                            });
                            $('.black').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        else{
                            if(data.isPlayerTurn){
                                websocketGame.isPlayerTurn = true;
                                $("#show-turn").append("Your turn to move.");
                                $('.black').each(function () {
                                    $(this).removeClass('not-clickable');

                                });
                                $('.white').each(function () {
                                    $(this).addClass('not-clickable');
                                });

                            }
                            else{
                                websocketGame.isPlayerTurn = false;
                                $("#show-turn").append("Wait for your partner to move.");
                                $('.black').each(function () {
                                    $(this).addClass('not-clickable');

                                });
                                $('.white').each(function () {
                                    $(this).addClass('not-clickable');
                                });
                            }
                            $('.black').each(function () {
                                $(this).removeClass('not-my-color');

                            });
                            $('.white').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        gc.loadFunctionality(LOAD);
                    }

                    if(data.load === false){
                        // white player
                        if(data.isPlayerTurn){
                            websocketGame.isPlayerTurn = true;
                            $("#show-turn").append("Your turn to move.");
                            let pieces = document.getElementsByClassName("piece");
                            for (let i = 0; i < pieces.length; ++i) {
                                pieces.item(i).classList.toggle('not-clickable');
                            }
                            $('.white').each(function () {
                                $(this).removeClass('not-my-color');
                            });
                            $('.black').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        // black player
                        else{
                            websocketGame.isPlayerTurn = false;
                            $("#show-turn").append("Wait for your partner to move.");
                            $('.black').each(function () {
                                $(this).removeClass('not-my-color');
                            });
                            $('.white').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        if(data.saveGame === true){
                            saveGame();
                        }
                    }
                }
            }
        };

        // on close event
        websocketGame.socket.onclose = function(e){
            console.log('WebSocket connection closed.');
        };
    }
});

// new game button
$("#new-game-button-1").click(startNewGame);
$("#new-game-button-2").click(startNewGame);

function startNewGame(){
    let newWebsocketGame = {
        GAME_LOGIC : 0,
        CHAT_MESSAGE : 1,
        MOVE : 2,
        LOGIN : 3,
        REGISTRATION : 4,
        GAME_INIT : 1,
        GAME_START : 2,
        GAME_OVER : 3,
        RESTART : 4,
        REVANCHE : 5,
        CHECK : 1,
        CHECKMATE : 2,
        REMIS : 3,
        PATT : 4,
        CAPITULATE : 5,
        isPlayerTurn: false,
        SAVE : 10,
        LOAD : 11,
        SHOW_GAMES: 12,
        LOAD_GAME:13,
        FAILURE : 0,
        SUCCESS : 1,
        WHITE : 1,
        BLACK : 0
    };

    newWebsocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

    // on open event
    newWebsocketGame.socket.onopen = function(e){
        console.log('WebSocket connection established.');
    };

    let data = {};
    data.dataType = newWebsocketGame.RESTART;
    //newWebsocketGame.socket.send(JSON.stringify(data));

    $("#popup-loose").addClass("hide");
}

// Login / Registration
$("#login-button").click(getLoginValues);
$("#register-button").click(getRegisterValues);

function getLoginValues(){
    let username = $("#username-input-login").val();
    let password = $("#pw-input-login").val();
    let data = {};
    data.dataType = websocketGame.LOGIN;
    data.username = username;
    data.password = password;
    websocketGame.socket.send(JSON.stringify(data));
}

function getRegisterValues(){
    let username = $("#username-input-login").val();
    let password = $("#pw-input-login").val();
    let data = {};
    data.dataType = websocketGame.REGISTRATION;
    data.username = username;
    data.password = password;
    websocketGame.socket.send(JSON.stringify(data));
}

// Chat Button / Field
$("#send").click(sendMessage);

$("#chat-input").keypress(function(event){
    let key = event.which || event.keyCode;
    if(key === 13){
        sendMessage();
    }
});

function sendMessage(){
    let message = $("#chat-input").val();
    let data = {};
    data.dataType = websocketGame.CHAT_MESSAGE;
    data.message = message;
    websocketGame.socket.send(JSON.stringify(data));
    $("#chat-input").val("");
}

// Move Button
$("#move").click(sendMove);

function sendMove(){
    let message = $("#show-move").html();
    let data = {};
    data.dataType = websocketGame.MOVE;
    // TODO data.gameState = ;
    data.from = [parseInt(message.charAt(0)), parseInt(message.charAt(2))];
    data.to = [parseInt(message.charAt(11)), parseInt(message.charAt(13))];
    websocketGame.socket.send(JSON.stringify(data));
    $("#show-move").html("-->");
}

/**
 * Synchronize move in view
 * @param {from} from field
 * @param {to} to field
 */
function movePiece(from, to){
    let fromNode;
    let toNode;
    let capturedPiece;
    let fields = document.querySelectorAll('.field');
    [].forEach.call(fields, function(field) {
        if($(field).data('col') === from[0] && $(field).data('row') === from[1]){
            $(field).children('div').each(function(){
                if (this.classList.contains("piece")){
                    fromNode = this;
                }
            });
        }
        if($(field).data('col') === to[0] && $(field).data('row') === to[1]){
            toNode = field;
            // check if piece is there
            $(field).children('div').each(function(){
                if (this.classList.contains("piece")){
                    capturedPiece = this;
                    //TODO: if captured piece is king, end game
                    console.log("cap: ", capturedPiece);
                }
            });
        }
    });
    if(toNode !== undefined && fromNode !== undefined){
        toNode.appendChild(fromNode);
        if(capturedPiece !== undefined){
            $(capturedPiece).removeClass("piece not-clickable not-my-color");
            $(capturedPiece).addClass("captured");
            let capturedPieces = document.getElementById("field-captured");
            capturedPieces.appendChild(capturedPiece);
        }
    }
}

function saveGame(){
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+' '+time;
    let board = document.getElementById("board");
    let fieldCaptured = document.getElementById("field-captured");
    let chatHistory = document.getElementById("chat-history");
    let data = {};
    data.dataType = websocketGame.SAVE;
    data.board = board.innerHTML;
    data.fieldCaptured = fieldCaptured.innerHTML;
    data.chatHistory = chatHistory.innerHTML;
    data.timestamp = dateTime;
    //data.user = username;
    websocketGame.socket.send(JSON.stringify(data));
}

// Load Button
$("#load").click(loadGame);
$("#load-game-button-1").click(loadGame);
$("#load-game-button-2").click(loadGame);

function loadGame(){
    $("#popup-loose").addClass("hide");
    let usernameElement = document.getElementById("username");
    username = usernameElement.innerHTML;
    let data = {};
    data.dataType = websocketGame.LOAD;
    data.loadUser = username;
    websocketGame.socket.send(JSON.stringify(data));
}

// Back Button in Load Window
$("#back-button-savedGames").click(goBack);

function goBack(){
    $("#show-saved-games").addClass("hide");
}

function appendToGames(roomId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, gameWhitePlayer, isMyTurn, iAmWhite) {
    //data.gameRoomIds[i], data.timestamps[i], data.boards[i], data.fieldsCaptured[i], data.chatsHistory[i], data.turns[i], data.whitePlayers[i], data.isMyTurns[i], data.iAmWhites[i
    let savedGames = this;
    let listElement = document.createElement('li');
    listElement.innerHTML = gameTimestamp;
    listElement.classList.add("load-when-clicked");
    $("#saved-games").append(listElement);
    listElement.addEventListener('click', function(){
        //SavedGames.loadGame(roomId, gameBoard, gameFieldsCaptured, gameChatHistory);
        loadSavedGame(roomId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, gameWhitePlayer, isMyTurn, iAmWhite);
    });
}

function loadSavedGame(roomId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, gameWhitePlayer, isMyTurn, iAmWhite) {
    let usernameElement = document.getElementById("username");
    username = usernameElement.innerHTML;
    $("#board").empty();
    $("#board").append(gameBoard);
    $("#field-captured").empty();
    $("#field-captured").append(gameFieldsCaptured);
    $("#chat-history").empty();
    $("#chat-history").append(gameChatHistory);

    let data = {};
    data.dataType = websocketGame.LOAD_GAME;
    data.roomId = roomId;
    data.turn = gameTurn;
    data.whitePlayer = gameWhitePlayer;
    data.isMyTurn = isMyTurn;
    data.iAmWhite = iAmWhite;
    data.sender = username;
    websocketGame.socket.send(JSON.stringify(data));

    $("#show-saved-games").addClass("hide");
    //location.reload();
}

