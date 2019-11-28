/**
 * Represents a websocket
 * @author: Irina
 *
 */

'use strict';

import Chat from './chat.js';
import SavedGames from "./savedGames.js";

let websocketGame = {
    GAME_LOGIC : 0,
    CHAT_MESSAGE : 1,
    MOVE : 2,
    LOGIN : 3,
    REGISTRATION : 4,
    WAITING_TO_START : 0,
    GAME_INIT : 1,
    GAME_START : 2,
    GAME_OVER : 3,
    REVANCHE : 4,
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
    FAILURE : 0,
    SUCCESS : 1
};

let username = "";

$(function(){
    if(window["WebSocket"]){
        let chat = new Chat();
        let savedGames = new SavedGames();

        // create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

        // on open event
        websocketGame.socket.onopen = function(e){
            console.log('WebSocket connection established.');
        };

        // on message event (executed when receiving a message from GameRoom)
        websocketGame.socket.onmessage = function(e){

            let data = JSON.parse(e.data);

            if(data.dataType !== websocketGame.LOGIN){
                console.log("Got message: ", e.data);
            }

            // login
            if(data.dataType === websocketGame.LOGIN){
                if(data.message === websocketGame.SUCCESS){
                    username = $("#username-input-login").val();
                    $("#login").addClass("hide");
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
                    $("#login").addClass("hide");
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
                        savedGames.appendToGames(data.timestamps[i], data.boards[i], data.fieldsCaptured[i], data.chatsHistory[i]);
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
                    // enable move button
                    document.getElementById("move").disabled = false;
                }
                else{
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
                    saveGame();
                }
            }
        };

        // on close event
        websocketGame.socket.onclose = function(e){
            console.log('WebSocket connection closed.');
        };
    }
});

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

// Save Button
$("#save").click(saveGame);

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
    websocketGame.socket.send(JSON.stringify(data));
}

// Load Button
$("#load").click(loadGame);

function loadGame(){
    let usernameElement = document.getElementById("username");
    username = usernameElement.innerHTML;
    let data = {};
    data.dataType = websocketGame.LOAD;
    data.loadUser = username;
    websocketGame.socket.send(JSON.stringify(data));
}

// Load Button
$("#back-button-savedGames").click(goBack);

function goBack(){
    $("#show-saved-games").addClass("hide");
}

