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
const SAVE = 10;
const LOAD = 11;
const SHOW_GAMES = 12;
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


export default class GameRoom extends Room {
     /**
     * Create a game room for two players with default values, send a message to all users when done
      */
    constructor() {
        super();
        this.id = "1" + Math.floor(Math.random() * 1000000000);
        this.playerTurn = 0;
        this.currentGameState = WAITING_TO_START;
        this.condition = NORMAL;

        let gameLogicData = {
            dataType: GAME_LOGIC,
            gameState: WAITING_TO_START,
        };
        this.sendAll(JSON.stringify(gameLogicData));

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
                // write move to mongodb
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    let move = { gameRoomId: room.id, user: user.id, move: [data.from, data.to] };
                    dbo.collection("games").insertOne(move, function(err, res) {
                        if (err) throw err;
                        db.close();
                    });
                });
            }

            // Username message
            if (data.dataType === LOGIN) {
                let dbUser = { user: user.id, username: data.username};
                let games = [];
                // write user to mongodb
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    let cursor = dbo.collection("usernames").find({"username":dbUser.username});
                    cursor.each(function(err, item) {
                        // If the item is null then the cursor is empty and closed
                        if(item == null) {
                            dbo.collection("usernames").insertOne(dbUser, function(err, res) {
                                if (err) throw err;
                                db.close();
                            });
                        }else{
                            //user already exists
                            let cursor2 = dbo.collection("savedGames").find({"users.id":item.user});
                            cursor2.each(function(err, item2) {
                                // If the item is null then the cursor is empty and closed
                                if(item2 == null) {
                                    db.close();
                                }else{
                                    games.push(item2.game);
                                    db.close();
                                    room.showSavedGamesForUser(user.id, games);
                                }
                            });
                        }
                    });
                });
                data.sender = user.id;
                room.sendAll(JSON.stringify(data));
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
                    room.currentGameState = GAME_RESTART;
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
                let game = data.game;

                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    let savedGame = { gameRoomId: room.id, users: room.users, game : game };
                    dbo.collection("savedGames").insertOne(savedGame, function(err, res) {
                        if (err) throw err;
                        db.close();
                    });
                });
            }

            // Load
            if (data.dataType === LOAD){
                let name = data.loadUser;
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    let cursor = dbo.collection("usernames").find({"username":name});
                    cursor.each(function(err, item) {
                        // If the item is null then the cursor is empty and closed
                        if(item == null) {
                            db.close();
                        }else{
                            //user id
                            console.log(item.user);
                            room.showSavedGamesForUser(user.id);
                            db.close();
                        }
                    });
                });
            }
        });
    };

    /**
     * Start the game, choose player which starts the game and notify only this player
     */
    startGame() {
        let room = this;

        // player this.users[this.playerTurn] will start the game
        this.playerTurn = (this.playerTurn + 1) % this.users.length;
        console.log("[GameRoom] Start game with player " + this.playerTurn + "'s turn.");

        // send a message to all players with isPlayerTurn: false
        let gameLogicDataForAllPlayers = {
            dataType: GAME_LOGIC,
            gameState: GAME_INIT,
            isPlayerTurn: false,
            isPlayerColorWhite: false,
        };
        this.sendAll(JSON.stringify(gameLogicDataForAllPlayers));

        // player who's turn it is, is sent a message with isPlayerTurn: true
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_INIT,
            isPlayerTurn: true,
            isPlayerColorWhite: true,
        };
        let user = this.users[this.playerTurn];
        user.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));

        room.currentGameState = GAME_START;
    }

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

        // player who's turn it is not, is sent a message with isPlayerTurn: false
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: false,
        };
        currentUser.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));

        // player who's turn it is, is sent a message with isPlayerTurn: true
        let gameLogicDataForNextPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: true,
        };
        nextUser.socket.send(JSON.stringify(gameLogicDataForNextPlayerTurn));
    }

    showSavedGamesForUser(userid, games){
        let currentUserId = userid;
        let currentUser;
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if(user.id === currentUserId){
                currentUser = user;
            }
        }
        // show all saved games for current player
        let savedGames = {
            dataType: SHOW_GAMES,
            games : games,
        };
        currentUser.socket.send(JSON.stringify(savedGames));
    }
}