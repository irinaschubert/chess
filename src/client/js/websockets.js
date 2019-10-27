/**
 * Represents a websocket
 * @author: Irina
 *
 * @todo make es6 class from it
 */

'use strict';

import Chat from './chat.js';

/*
const GAME_LOGIC = 0;
const CHAT_MESSAGE = 1;
const MOVE = 2;
// game state
const WAITING_TO_START = 0;
const GAME_INIT = 1;
const GAME_START = 2;
const GAME_OVER = 3;
const REVANCHE = 4;
// game or end condition
const NORMAL = 0;
const CHECK = 1;
const CHECKMATE = 2;
const REMIS = 3;
const PATT = 4;
const CAPITULATE = 5;
* */


let websocketGame = {
    GAME_LOGIC : 0,
    CHAT_MESSAGE : 1,
    MOVE : 2,
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
};

$(function(){
    if(window["WebSocket"]){
        let chat = new Chat();

        // create connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

        // on open event
        websocketGame.socket.onopen = function(e){
            console.log('WebSocket connection established.');
        };

        // on message event (executed when receiving a message from GameRoom)
        websocketGame.socket.onmessage = function(e){
            console.log("Got message: ", e.data);
            let data = JSON.parse(e.data);

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
                    $("#chat-history").append("<li>"+data.winner+" wins! The answer is '" + data.answer+ "'.</li>");
                    $("#restart").show();
                }

                if(data.gameState === websocketGame.GAME_START){
                    $("#restart").hide();
                    let pieces = document.getElementsByClassName("piece");
                    for (let i = 0; i < pieces.length; ++i) {
                        pieces.item(i).classList.toggle('not-clickable');
                    }

                    if(data.isPlayerTurn){
                        websocketGame.isPlayerTurn = true;
                        $("#chat-history").append("<li>Your turn to move.</li>");
                    }
                    else{
                        websocketGame.isPlayerTurn = false;
                        $("#chat-history").append("<li>Wait for your partner to move.</li>");
                    }
                }

                if(data.gameState === websocketGame.GAME_INIT){
                    $("#restart").hide();
                    $("#chat-history").html("");
                    if(data.isPlayerTurn){
                        websocketGame.isPlayerTurn = true;
                        $("#chat-history").append("<li>Your turn to move.</li>");
                        let pieces = document.getElementsByClassName("piece");
                        for (let i = 0; i < pieces.length; ++i) {
                            pieces.item(i).classList.toggle('not-clickable');
                        }

                    }
                    else{
                        websocketGame.isPlayerTurn = false;
                        $("#chat-history").append("<li>Wait for your partner to move.</li>");
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
    $("#show-move").html('');
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
        // TODO: do that also in gameController --> append captured piece ot field-captured
        if(capturedPiece !== undefined){
            let capturedPieces = document.getElementById("field-captured");
            capturedPieces.appendChild(capturedPiece);
            //capturedPiece.remove();
        }
    }
}