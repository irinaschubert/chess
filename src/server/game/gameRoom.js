/** Class representing the game room and handles users and messages
 *  @author Irina
 *  @extends Room
 * */

'use strict';

import Room from "./room.js";
import {MongoClient} from "mongodb";
let url = "mongodb://localhost:27017/";

// constants
// data type
const GAME_LOGIC = 0;
const CHAT_MESSAGE = 1;
const MOVE = 2;
const LOGIN = 3;
const REGISTRATION = 4;
const SAVE = 10;
const LOAD = 11;
const SHOW_GAMES = 12;
const LOAD_GAME = 13;
// game state
const GAME_INIT = 1;
const GAME_START = 2;
const GAME_OVER = 3;
const REVANCHE = 4;
// condition
const NORMAL = 0;
const CHECK = 1;
const CHECKMATE = 2;
const REMIS = 3;
const PATT = 4;
const CAPITULATE = 5;
// message
const FAILURE = 0;
const SUCCESS = 1;
// color
const WHITE = 1;
const BLACK = 0;

export default class GameRoom extends Room {
     /**
     * Create a game room for two players with default values, send a message to all users when done
      */
    constructor() {
        super();
        this.id = "1" + Math.floor(Math.random() * 1000000000);
        this.playerTurn = 0;
        this.condition = NORMAL;
    }

    /**
     * Adds a user to the game room. If two users are in the room, start the game.
     * @extends Room.addUser
     * @param  {User} user - user to add
     */
    addUser(user) {
        super.addUser(user);
        if (this.users.length === 2) {
            this.startGame();
        }
    };

    /**
     * Handles user messages according to their type
     * @param  {User} user - sender
     */
    handleOnUserMessage(user) {
        let room = this;
        user.socket.on("message", function (message) {
            console.log("[GameRoom] Got message from " + user.id + ": " + message);

            let data = JSON.parse(message);

            // Chat message
            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.id;
                room.sendAll(JSON.stringify(data));
            }

            // Move message
            if (room.currentGameState === GAME_START && data.dataType === MOVE) {
                room.makeMove(user.id, data.from, data.to);
            }

            // Login message
            if (data.dataType === LOGIN) {
                let dbUser = { user: user.id, username: data.username, password: data.password};
                let games = [];

                // check username and password
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    let userCheck = new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": dbUser.username, "password":dbUser.password}));
                    });

                    userCheck.then(function (value) {
                        if (value !== null) {
                            //user exists and password is correct
                            let loginMessage = {
                                dataType: LOGIN,
                                username: dbUser.username,
                                message: SUCCESS,
                            };
                            user.socket.send(JSON.stringify(loginMessage));
                        } else {
                            let loginMessage = {
                                dataType: LOGIN,
                                username: dbUser.username,
                                message: FAILURE,
                            };
                            user.socket.send(JSON.stringify(loginMessage));
                        }
                    });
                });
            }

            // Registration message
            if (data.dataType === REGISTRATION) {
                let dbUser = { user: user.id, username: data.username, password: data.password, white: true};

                // write new user to mongodb if not exists already
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    let userCheck = new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": dbUser.username}));
                    });

                    userCheck.then(function (value) {
                        if (value !== null) {
                            //user already exists
                            let registrationMessage = {
                                dataType: REGISTRATION,
                                username: dbUser.username,
                                message: FAILURE,
                            };
                            user.socket.send(JSON.stringify(registrationMessage));
                        } else {
                            dbo.collection("users").insertOne(dbUser, function (err, res) {
                                if (err) throw err;
                                db.close();
                            });
                            let registrationMessage = {
                                dataType: REGISTRATION,
                                username: dbUser.username,
                                message: SUCCESS,
                            };
                            user.socket.send(JSON.stringify(registrationMessage));
                        }
                    });
                });
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
                        condition: CHECKMATE,
                        winner: user.id,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = GAME_OVER;
                }

                // Remis
                if (room.currentGameState === GAME_START && room.condition === REMIS) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        condition: REMIS,
                        winner: user.id,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = GAME_OVER;
                }

                // Patt
                if (room.currentGameState === GAME_START && room.condition === PATT) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        condition: PATT,
                        winner: user.id,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = GAME_OVER;
                }

                // Revanche
                if (room.currentGameState === GAME_OVER) {
                    let gameLogicData = {
                        dataType: REVANCHE,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = GAME_START;
                }

                // Capitulate
                if (room.currentGameState === GAME_START) {
                    let gameLogicData = {
                        dataType: CAPITULATE,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = GAME_OVER;
                }
            }

            // Save
            if (data.dataType === SAVE){
                let board = data.board;
                let fieldCaptured = data.fieldCaptured;
                let chatHistory = data.chatHistory;
                let timestamp = data.timestamp;
                let turn = data.turn;

                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    let updateSave = new Promise(async function(resolve, reject){
                        let result = await (dbo.collection("savedGames").findOne({"gameRoomId": room.id}));
                        if(result === null){
                            resolve(0);
                        }
                        else{
                            resolve(result.turn);
                        }

                    });

                    updateSave.then( function(value){
                        let newTurn = (value + 1) % 2;
                        dbo.collection("savedGames").updateOne(
                            {"gameRoomId" : room.id},
                            {$set:{
                                "gameRoomId": room.id, "users": room.users, "board": board, "fieldCaptured": fieldCaptured, "chatHistory": chatHistory, "timestamp": timestamp, "turn": newTurn
                            }},
                            { upsert: true });
                        db.close();
                    });

                    /*dbo.collection("savedGames").insertOne(savedGame, function(err, res) {
                        if (err) throw err;
                        db.close();
                    });*/
                });
            }

            // Load
            if (data.dataType === LOAD) {
                let fullName = data.loadUser;

                MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": fullName}));
                    }).then(function (value) {
                        return value.user;
                    }).then(function (value) {
                        return dbo.collection("savedGames").find({"users.id": value});
                    }).then(async function (value) {
                        let boards = [];
                        let fieldsCaptured = [];
                        let chatsHistory = [];
                        let gameTimestamps = [];
                        let turns = [];
                        for await (const item of value) {
                            if (item !== null) {
                                boards.push(item.board);
                                fieldsCaptured.push(item.fieldCaptured);
                                chatsHistory.push(item.chatHistory);
                                gameTimestamps.push(item.timestamp);
                                turns.push(item.turn);

                            }
                        }
                        return [gameTimestamps, boards, fieldsCaptured, chatsHistory, turns];
                    }).then(function (value) {
                        db.close();
                        room.showSavedGamesForUser(user.id, value);
                    });
                });
            }

            // Load Game
            if (data.dataType === LOAD_GAME){
                this.id = data.roomId;
            }
        });
    };

    /**
     * Start the game, choose player which starts the game and notify only this player
     */
    startGame() {
        let room = this;

        // player this.users[this.playerTurn] will start the game --> spoiler: it's always player 1 :)
        this.playerTurn = (this.playerTurn + 1) % this.users.length;
        console.log("[GameRoom] Start game with player " + this.users[this.playerTurn].id + "'s turn.");

        // send a message to all players with isPlayerTurn: false (black player)
        let gameLogicDataForAllPlayers = {
            dataType: GAME_LOGIC,
            gameState: GAME_INIT,
            isPlayerTurn: false,
            saveGame: false,
            turn: WHITE
        };
        this.sendAll(JSON.stringify(gameLogicDataForAllPlayers));

        // player who's turn it is, is notified with isPlayerTurn: true (white player)
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_INIT,
            isPlayerTurn: true,
            saveGame: true,
            turn: WHITE
        };
        let user = this.users[this.playerTurn];
        let otherUser = this.users[0];
        user.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));

        room.currentGameState = GAME_START;

        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");

            let userUpdate = new Promise(function (resolve, reject) {
                resolve(
                    dbo.collection("users").updateOne(
                        {"user" : otherUser.id},
                        {$set:{
                                "white": false
                            }},
                        { upsert: false }
                    )
                );
            });

            userUpdate.then(function (value) {
                db.close();
            });
        });
    }

    /**
     * Move pieces and notify player's about their turn
     */
    makeMove(id, from, to){
        let room = this;
        let currentUserId = id;
        let currentUser;
        let nextUser;
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if(user.id === currentUserId){
                currentUser = user;
            }
            else{
                nextUser = user;
            }
        }

        let moveData = {
            dataType: MOVE,
            from: from,
            to: to,
        };
        room.sendAll(JSON.stringify(moveData));

        // player who just moved, is sent a message with isPlayerTurn: false
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: false,
        };
        currentUser.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));

        // player who's turn it is, is notified with isPlayerTurn: true
        let gameLogicDataForNextPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: true,
        };
        nextUser.socket.send(JSON.stringify(gameLogicDataForNextPlayerTurn));
    }

    /**
     * Show saved games for current user
     */
    showSavedGamesForUser(userId, games){
        let gameTimestamps = games[0];
        let gameBoards = games[1];
        let gameFieldCaptured = games[2];
        let gameChatHistory = games[3];
        let gameTurn = games[4];
        let currentUserId = userId;
        let currentUser;
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if(user.id === currentUserId){
                currentUser = user;
            }
        }

        let savedGames = {
            dataType: SHOW_GAMES,
            gameRoomId : this.id,
            timestamps : gameTimestamps,
            boards : gameBoards,
            fieldsCaptured : gameFieldCaptured,
            chatsHistory : gameChatHistory,
            turns : gameTurn
        };
        currentUser.socket.send(JSON.stringify(savedGames));
    }
}