/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
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
                websocketGame.isTurnToMove = true;
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
    if(event.keyCode === 13){
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
    data.from = [parseInt(message.charAt(0)), parseInt(message.charAt(2))];
    data.to = [parseInt(message.charAt(11)), parseInt(message.charAt(13))];

    websocketGame.socket.send(JSON.stringify(data));
    $("#show-move").html('');
}