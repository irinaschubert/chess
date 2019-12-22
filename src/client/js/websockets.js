/**
 * Represents a websocket
 * @author: Irina
 *
 */

'use strict';

import Chat from './chat.js';
import GameControllerClass from "./gameControllerClass.js";

let websocketGame = {
    GAME_INIT : 1,
    GAME_START : 2,
    GAME_OVER : 3,
    GAME_LOGIC : 0,
    CHAT_MESSAGE : 1,
    MOVE : 2,
    LOGIN : 3,
    REGISTRATION : 4,
    ALREADY_LOGGED_IN : 5,
    SAVE : 10,
    LOAD : 11,
    SHOW_GAMES: 12,
    LOAD_GAME:13,
    NEW: 14,
    FAILURE : 0,
    SUCCESS : 1,
    WON : 0,
    LOST : 1,
    isPlayerTurn: false
};

let username = "";

$(function(){
    //check if browser supports websockets
    if(window["WebSocket"]){
        let chat = new Chat();
        let gc = new GameControllerClass();

        // create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

        // on open event
        websocketGame.socket.onopen = function(e){
            console.log("WebSocket connection established.");
        };

        // on message event (executed when receiving a message from GameRoom)
        websocketGame.socket.onmessage = function(e){

            let data = JSON.parse(e.data);

            if(data.dataType !== websocketGame.LOGIN && data.dataType !== websocketGame.SHOW_GAMES){
                // use the console output for debugging - but don't show password (because it's secret) or game board (because it's too much...)
                //console.log("Got message: ", e.data);
            }

            // login
            if(data.dataType === websocketGame.LOGIN){
                if(data.message === websocketGame.SUCCESS){
                    username = $("#username-input-login").val();
                    $("#login").addClass("hide");
                    $("#footer").removeClass("hide");
                    $("#navbar").removeClass("hide");
                    $("#username").append(data.username);
                    $("#show-turn").append("Welcome to Chess. Please choose what to do.");
                }
                else if(data.message === websocketGame.ALREADY_LOGGED_IN){
                    let loginText = document.getElementById("login-text");
                    loginText.innerHTML = "Already logged in. Please log out of your open session before logging in.";
                }
                else if(data.message === websocketGame.FAILURE){
                    let loginText = document.getElementById("login-text");
                    loginText.innerHTML = "Wrong username or password.";
                    $("#pw-input-login").val("");
                }
            }

            // registration
            if(data.dataType === websocketGame.REGISTRATION){
                if(data.message === websocketGame.SUCCESS){
                    username = data.username;
                    $("#login").addClass("hide");
                    $("#footer").removeClass("hide");
                    $("#navbar").removeClass("hide");
                    $("#username").append(data.username);
                    $("#show-turn").append("Welcome to Chess. Please choose what to do.");
                }
                else if(data.message === websocketGame.FAILURE){
                    let loginText = document.getElementById("login-text");
                    loginText.innerHTML = "Username already exists";
                    $("#pw-input-login").val("");
                }
            }

            // load
            else if (data.dataType === websocketGame.SHOW_GAMES){
                if(data.gameIds !== []){
                    $("#saved-games").empty();
                    for(let i in data.gameIds){
                        appendToGames(data.gameIds[i], data.timestamps[i], data.boards[i],
                            data.fieldsCaptured[i], data.chatsHistory[i], data.turns[i],
                            data.isMyTurns[i], data.iAmWhites[i], data.users[i]);
                    }
                    $("#show-saved-games").removeClass("hide");
                    $("#capitulate").addClass("hide");
                }
            }

            // chat
            if(data.dataType === websocketGame.CHAT_MESSAGE){
                chat.appendToHistory(data.sender, data.message, data.toAll);
            }

            // move
            else if (data.dataType === websocketGame.MOVE){
                movePiece(data.from, data.to);
                if(websocketGame.isPlayerTurn === false){
                    // enable move button
                    document.getElementById("move").disabled = false;
                }
                else{
                    // disable move button
                    document.getElementById("move").disabled = true;
                    saveGame();
                }
            }

            // logic message
            else if (data.dataType === websocketGame.GAME_LOGIC){

                // game over
                if(data.gameState === websocketGame.GAME_OVER){
                    if(data.message === websocketGame.WON){
                        $("#popup-win").removeClass("hide");
                    }
                    else{
                        $("#popup-loose").removeClass("hide");
                    }
                }

                // game play
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
                    $("#send-to-partner").removeClass("hide");
                }

                // game initialisation
                if(data.gameState === websocketGame.GAME_INIT){
                    $("#show-turn").html("");
                    $("#gameId").html(data.gameId);
                    $("#send-to-partner").removeClass("hide");

                    //behave differently if game is loaded
                    if(data.load === true){
                        if(data.iAmWhite){
                            $("#color").html("1");
                            if(data.isPlayerTurn){
                                websocketGame.isPlayerTurn = true;
                                $("#show-turn").append("Your turn to move.");
                                $('.white').each(function () {
                                    $(this).removeClass('not-clickable');

                                });
                                $('.black').each(function () {
                                    $(this).addClass('not-clickable');
                                });
                                document.getElementById("move").disabled = false;

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
                                document.getElementById("move").disabled = true;
                            }
                            $('.white').each(function () {
                                $(this).removeClass('not-my-color');

                            });
                            $('.black').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        else{
                            $("#color").html("0");
                            if(data.isPlayerTurn){
                                websocketGame.isPlayerTurn = true;
                                $("#show-turn").append("Your turn to move.");
                                $('.black').each(function () {
                                    $(this).removeClass('not-clickable');

                                });
                                $('.white').each(function () {
                                    $(this).addClass('not-clickable');
                                });
                                document.getElementById("move").disabled = false;

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
                                document.getElementById("move").disabled = true;
                            }
                            $('.black').each(function () {
                                $(this).removeClass('not-my-color');

                            });
                            $('.white').each(function () {
                                $(this).addClass('not-my-color');
                            });
                        }
                        $("#main").removeClass("hide");
                        gc.loadFunctionality(1);
                    }

                    if(data.load === false){
                        gc.loadFunctionality(0);
                        // white player
                        if(data.isPlayerTurn){
                            $("#color").html("1");
                            $("#show-turn").append("Your turn to move.");
                            websocketGame.isPlayerTurn = true;
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
                            document.getElementById("move").disabled = false;
                        }
                        // black player
                        else{
                            $("#color").html("0");
                            $("#show-turn").append("Wait for your partner to move.");
                            websocketGame.isPlayerTurn = false;
                            $('.black').each(function () {
                                $(this).removeClass('not-my-color');
                            });
                            $('.white').each(function () {
                                $(this).addClass('not-my-color');
                            });
                            document.getElementById("move").disabled = true;
                        }
                        $("#main").removeClass("hide");
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
$("#new-game-button-1").click(newGame);
$("#new-game-button-2").click(newGame);

// login / registration buttons
$("#login-button").click(login);
$("#register-button").click(register);

function login(){
    let username = $("#username-input-login").val();
    let password = $("#pw-input-login").val();
    let data = {};
    data.dataType = websocketGame.LOGIN;
    data.username = username;
    data.password = password;
    websocketGame.socket.send(JSON.stringify(data));
}

function register(){
    let username = $("#username-input-login").val();
    let password = $("#pw-input-login").val();
    let data = {};
    data.dataType = websocketGame.REGISTRATION;
    data.username = username;
    data.password = password;
    websocketGame.socket.send(JSON.stringify(data));
}

// chat button / field
$("#send").click(sendMessageToAll);
$("#send-to-partner").click(sendMessageToPartner);

$("#chat-input").keypress(function(event){
    let key = event.which || event.keyCode;
    if(key === 13){
        sendMessageToAll();
    }
});

function sendMessageToAll(){
    let message = $("#chat-input").val();
    let data = {};
    data.dataType = websocketGame.CHAT_MESSAGE;
    data.toAll = true;
    data.message = message;
    websocketGame.socket.send(JSON.stringify(data));
    $("#chat-input").val("");
}

function sendMessageToPartner(){
    let message = $("#chat-input").val();
    let data = {};
    data.dataType = websocketGame.CHAT_MESSAGE;
    data.toAll = false;
    let gameId = document.getElementById("gameId");
    data.gameId = gameId.innerHTML;
    data.message = message;
    websocketGame.socket.send(JSON.stringify(data));
    $("#chat-input").val("");
}

// move button
$("#move").click(sendMove);

function sendMove(){
    // check if king was captured
    let won = document.getElementById("king");
    if(won.innerHTML === "1"){
        gameOver(websocketGame.WON);
        $("king").html("");
    }
    else{
        let message = $("#show-move").html();
        let data = {};
        data.dataType = websocketGame.MOVE;
        data.from = [parseInt(message.charAt(0)), parseInt(message.charAt(2))];
        data.to = [parseInt(message.charAt(11)), parseInt(message.charAt(13))];
        let gameId = document.getElementById("gameId");
        data.gameId = gameId.innerHTML;
        websocketGame.socket.send(JSON.stringify(data));
        $("#show-move").html("-->");
    }
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

// save
function saveGame(){
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let board = document.getElementById("board");
    let fieldCaptured = document.getElementById("field-captured");
    let chatHistory = document.getElementById("chat-history");
    let dateTime = date+' '+time;
    let gameId = document.getElementById("gameId");
    let data = {};
    data.dataType = websocketGame.SAVE;
    data.board = board.innerHTML;
    data.fieldCaptured = fieldCaptured.innerHTML;
    data.chatHistory = chatHistory.innerHTML;
    data.timestamp = dateTime;
    data.gameId = gameId.innerHTML;
    websocketGame.socket.send(JSON.stringify(data));
}

// load buttons
$("#load").click(loadGame);
$("#load-game-button-1").click(loadGame);
$("#load-game-button-2").click(loadGame);

function loadGame(){
    $("#popup-loose").addClass("hide");
    $("#popup-win").addClass("hide");
    let data = {};
    data.dataType = websocketGame.LOAD;
    websocketGame.socket.send(JSON.stringify(data));
}

// new button
$("#new").click(newGame);

function newGame(){
    $("#field-captured").empty();
    $("#capitulate").removeClass("hide");
    $("#show-turn").html("Wait for another user...");
    $("#main").addClass("hide");
    $("#send-to-partner").addClass("hide");
    $("#popup-loose").addClass("hide");
    $("#popup-win").addClass("hide");
    let data = {};
    data.dataType = websocketGame.NEW;
    websocketGame.socket.send(JSON.stringify(data));
}

// back button in load window
$("#back-button-savedGames").click(goBack);

function goBack(){
    $("#show-saved-games").addClass("hide");
    if($("#main").hasClass("hide")){
        $("#capitulate").addClass("hide");
    }else{
        $("#capitulate").removeClass("hide");
    }

}

// show saved games
function appendToGames(gameId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, isMyTurn, iAmWhite, user) {
    let listElement = document.createElement('li');
    listElement.innerHTML = user[0] + " vs. " + user[1] + ", " + gameTimestamp;
    listElement.classList.add("load-when-clicked");
    $("#saved-games").append(listElement);
    listElement.addEventListener('click', function(){
        loadSavedGame(gameId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, isMyTurn, iAmWhite);
    });
}

// load game
function loadSavedGame(gameId, gameTimestamp, gameBoard, gameFieldsCaptured, gameChatHistory, gameTurn, isMyTurn, iAmWhite) {
    $("#capitulate").removeClass("hide");
    $("#board").empty();
    $("#board").append(gameBoard);
    $("#field-captured").empty();
    $("#field-captured").append(gameFieldsCaptured);
    $("#chat-history").empty();
    $("#chat-history").append(gameChatHistory);

    let data = {};
    data.dataType = websocketGame.LOAD_GAME;
    data.gameId = gameId;
    data.turn = gameTurn;
    data.isMyTurn = isMyTurn;
    data.iAmWhite = iAmWhite;
    websocketGame.socket.send(JSON.stringify(data));

    $("#show-saved-games").addClass("hide");
}

// capitulate button
$('#capitulate').click(() => {
    gameOver(websocketGame.LOST);
});

// game over
function gameOver(lostOrWon){
    $("#capitulate").addClass("hide");
    if(lostOrWon === websocketGame.LOST){
        $("#popup-loose").removeClass("hide");
        let data = {};
        data.dataType = websocketGame.GAME_LOGIC;
        data.gameState = websocketGame.GAME_OVER;
        data.lostOrWon = websocketGame.LOST;
        let gameId = document.getElementById("gameId");
        data.gameId = gameId.innerHTML;
        websocketGame.socket.send(JSON.stringify(data));
    }
    else if(lostOrWon === websocketGame.WON){
        $("#popup-win").removeClass("hide");
        let data = {};
        data.dataType = websocketGame.GAME_LOGIC;
        data.gameState = websocketGame.GAME_OVER;
        data.lostOrWon = websocketGame.WON;
        let gameId = document.getElementById("gameId");
        data.gameId = gameId.innerHTML;
        websocketGame.socket.send(JSON.stringify(data));
    }
}