/**
 * Represents a websocket
 * @author: Irina
 *
 * @todo make es6 class from it
 */

'use strict';

import Chat from './chat.js';

let websocketGame = {
    playersTurn : 0,
    CHAT_MESSAGE : 1,
    GAME_LOGIC : 2,
    MOVE : 3,
    WAITING_TO_START : 0,
    GAME_START : 1,
    GAME_OVER : 2,
    GAME_RESTART : 3,
    NORMAL : 0,
    CHECK : 1,
    CHECKMATE : 2,
    REMIS : 3,
    PATT : 4,
    isTurnToMove: false,
};

$(function(){
    if(window["WebSocket"]){
        let chat = new Chat();

        // crate connection
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

            else if (data.dataType === websocketGame.GAME_LOGIC){

            }

            // make move if it is a move
            else if (data.dataType === websocketGame.MOVE){
                // if it was not players move, it is now players move
                if(websocketGame.isTurnToMove === false){
                    websocketGame.isTurnToMove = true;
                }
                else{
                    websocketGame.isTurnToMove = false;
                }
                // if it was not players move, synchronize enemy's move
                movePiece(data.from, data.to);

            }

            // take action if it is a game logic message
            else if (data.dataType === websocketGame.GAME_LOGIC){
                if(data.gameState === websocketGame.GAME_OVER){
                    websocketGame.isTurnToMove = false;
                    $("#chat-history").append("<li>"+data.winner+" wins! The answer is '" + data.answer+ "'.</li>");
                    $("#restart").show();
                }
                if(data.gameState === websocketGame.GAME_START){
                    $("#restart").hide();
                    $("#chat-history").html("");

                    if(data.isPlayerTurn){
                        websocketGame.isTurnToMove = true;
                        $("#chat-history").append("<li>Your turn to move.</li>");
                    }
                    else{
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

function movePiece(from, to){
    let fromNode;
    let toNode;
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

        }
    });
    if(toNode !== undefined && fromNode !== undefined){
        toNode.appendChild(fromNode);
    }
}