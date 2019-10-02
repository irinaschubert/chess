/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Room from "./room.js";
// data type
const CHAT_MESSAGE = 1;
const GAME_LOGIC = 2;
// game state
const WAITING_TO_START = 0;
const GAME_START = 1;
const GAME_OVER = 2;
const GAME_RESTART = 3;
// condition
const NORMAL = 0;
const CHECK = 1;
const CHECKMATE = 2;
const REMIS = 3;
const PATT = 4;

export default class GameRoom extends Room {
    constructor() {
        super();
        this.playerTurn = 0;
        this.currentGameState = WAITING_TO_START;
        this.condition = NORMAL;

        let gameLogicData = {
            dataType: GAME_LOGIC,
            gameState: WAITING_TO_START,
        };

        this.sendAll(JSON.stringify(gameLogicData));
    }

    addUser(user) {
        super.addUser(user);
        if (this.currentGameState === WAITING_TO_START && this.users.length === 2) {
            this.startGame();
        }
    };

    handleOnUserMessage(user) {
        let room = this;
        user.socket.on("message", function (message) {
            console.log("[GameRoom] Received message from " + user.id + ": " + message);

            let data = JSON.parse(message);

            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.id;
            }
            room.sendAll(JSON.stringify(data));

            // Chat message
            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.id;
                console.log("Current state: " + room.currentGameState);

                if (room.currentGameState === GAME_START) {
                    console.log("Got message: " + data.message);
                }
            }

            // Game logic message
            if (data.dataType === GAME_LOGIC){
                // Check
                if (room.currentGameState === GAME_START && room.condition === CHECK) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        condition: CHECK,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                }

                // Check mate
                if (room.currentGameState === GAME_START && room.condition === CHECKMATE) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        gameState: GAME_OVER,
                        winner: user.id,
                        condition: CHECKMATE,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = WAITING_TO_START;
                }

                // Remis
                if (room.currentGameState === GAME_START && room.condition === REMIS) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        gameState: GAME_OVER,
                        winner: user.id,
                        condition: REMIS,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = WAITING_TO_START;
                }

                // Patt
                if (room.currentGameState === GAME_START && room.condition === PATT) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        gameState: GAME_OVER,
                        winner: user.id,
                        condition: PATT,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = WAITING_TO_START;
                }

                if (data.gameState === GAME_RESTART) {
                    room.startGame();
                }
            }

        });
    };

    startGame() {
        let room = this;

        this.playerTurn = (this.playerTurn + 1) % this.users.length;

        console.log("Start game with player " + this.playerTurn + "'s turn.");

        let gameLogicDataForAllPlayers = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: false,
        };

        this.sendAll(JSON.stringify(gameLogicDataForAllPlayers));

        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: true,
        };

        let user = this.users[this.playerTurn];
        user.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));


        // use this code if you wish to implement time out game over
        /*let gameOverTimeout = setTimeout(function () {
            let gameLogicData = {
                dataType: GAME_LOGIC,
                gameState: GAME_OVER,
                winner: "No one",
            };

            room.sendAll(JSON.stringify(gameLogicData));

            room.currentGameState = WAITING_TO_START;
        }, 60 * 1000);*/

        room.currentGameState = GAME_START;
    }
}