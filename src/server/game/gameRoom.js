/** Class representing the game room and handles users and messages
 *  @author Irina
 *  @extends Room
 * */

'use strict';

import Room from "./room.js";
import {MongoClient} from "mongodb";
import User from "./user";
import Game from "./game";
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
const NEW = 14;
// game state
const GAME_INIT = 1;
const GAME_START = 2;
const GAME_OVER = 3;
const RESTART = 40;
const REVANCHE = 5;
// condition
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
// game
const G_INIT = 0;
const G_START = 1;
const G_END = 2;

export default class GameRoom extends Room {
     /**
     * Create a game room
      */
    constructor() {
        super();
        this.games = [];
    }

    /**
     * Adds a user to the game room. If two users are in the room, start the game.
     * @extends Room.addUser
     * @param  {User} user - user to add
     */
    addUser(user) {
        super.addUser(user);
        /*if (this.users.length === 2) {
            this.startGame();
        }*/
    };

    /**
     * Handles user messages according to their type
     * @param  {User} user - sender
     */
    handleOnUserMessage(user) {
        let room = this;
        user.socket.on("message", function (message) {
            //use this for debugging
            console.log("[GameRoom] Got message from " + user.socketId + ": " + message);

            let data = JSON.parse(message);

            // Chat message
            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.socketId;
                room.sendAll(JSON.stringify(data));
            }

            // Move message
            if (room.currentGameState === GAME_START && data.dataType === MOVE) {
                room.makeMove(user.socketId, data.from, data.to);
            }

            // Login message
            if (data.dataType === LOGIN) {
                let dbUser = { socketId: user.socketId, username: data.username, password: data.password};

                // check username and password
                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    let userCheck = new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": dbUser.username, "password":dbUser.password}));
                    });

                    userCheck.then(function (value) {
                        //user exists and password is correct
                        if (value !== null) {
                            let updateUserId = new Promise(function (resolve, reject) {
                                resolve(dbo.collection("users").updateOne({"username": dbUser.username},{$set:{userId: dbUser.socketId}}));
                            });

                            let loginMessage = {
                                dataType: LOGIN,
                                username: dbUser.username,
                                message: SUCCESS,
                            };
                            user.socket.send(JSON.stringify(loginMessage));
                        //user does not exist or password is wrong
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
                let dbUser = { userId: user.socketId, username: data.username, password: data.password};

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
                //let socket = data.socket;
                //let username = data.user;

                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    let updateSave = new Promise(async function(resolve, reject){
                        let result = await (dbo.collection("savedGames").findOne({"gameRoomId": room.id}));
                        if(result === null){
                            //when game is saved for the first time, initialise correctly with 0
                            resolve([0,user.id]);
                        }
                        else{
                            //let nameWhitePlayer = await (dbo.collection("users").findOne({"user": user.id}));
                            //resolve([result.turn,nameWhitePlayer.username]);
                            resolve([result.turn,result.whitePlayer]);
                        }

                    });

                    updateSave.then( async function(value){
                        let turn = value[0];
                        //change turn each time game is saved by active player
                        let newTurn = (turn + 1) % 2;

                        let whitePlayer = value[1];


                        dbo.collection("savedGames").updateOne(
                            {"gameRoomId" : room.id},
                            {$set:{
                                "gameRoomId": room.id, "users": room.users, "board": board, "fieldCaptured": fieldCaptured, "chatHistory": chatHistory, "timestamp": timestamp, "turn": newTurn, "whitePlayer": whitePlayer,
                            }},
                            { upsert: true });
                        db.close();
                    });
                });
            }

            // Load
            if (data.dataType === LOAD) {
                let fullName = data.loadUser;

                // return all games where loadUser is involved
                MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": fullName}));
                    }).then(function (value) {
                        return value.user;
                    }).then(function (value) {
                        return ([dbo.collection("savedGames").find({"users.id": value}),value]);
                    }).then(async function (value) {
                        let gameRoomIds = [];
                        let boards = [];
                        let fieldsCaptured = [];
                        let chatsHistory = [];
                        let gameTimestamps = [];
                        let turns = [];
                        let whitePlayer = [];
                        let isMyTurn = [];
                        let userId = value[1];
                        let iAmWhite = [];
                        for await (const item of value[0]) {
                            if (item !== null) {
                                gameRoomIds.push(item.gameRoomId);
                                boards.push(item.board);
                                fieldsCaptured.push(item.fieldCaptured);
                                chatsHistory.push(item.chatHistory);
                                gameTimestamps.push(item.timestamp);
                                turns.push(item.turn);
                                whitePlayer.push(item.whitePlayer);
                                if(userId.localeCompare(item.whitePlayer) === 0){
                                    iAmWhite.push(true);
                                }
                                else{
                                    iAmWhite.push(false);
                                }
                                if(userId.localeCompare(item.whitePlayer) === 0 && item.turn === 1){
                                    isMyTurn.push(true);
                                }else if(userId.localeCompare(item.whitePlayer) === 1 && item.turn === 0){
                                    isMyTurn.push(true)
                                }else{
                                    isMyTurn.push(false)
                                }
                            }
                        }
                        return [gameRoomIds, gameTimestamps, boards, fieldsCaptured, chatsHistory, turns, whitePlayer, isMyTurn, iAmWhite];
                    }).then(function (value) {
                        db.close();
                        room.showSavedGamesForUser(user.id, value);
                    });
                });
            }

            if (data.dataType === NEW) {
                room.startGame(user);
                /*MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    new Promise(function (resolve, reject) {
                        resolve(dbo.collection("users").findOne({"username": data.username}));
                    }).then(async function (dbUser) {
                        let userSocket = await dbo.collection("userSockets").findOne({"socketId": dbUser.userId});
                        return [userSocket, dbUser];
                    }).then(function (user) {
                        for(let i in room.users){
                            console.log(room.users[i]);
                            if(room.users[i].socket === user[0].socket){
                                console.log("yes");
                            }
                        }
                        room.startGame(user[0], user[1]);
                    })
                });*/
            }

            /*if (data.dataType === RESTART) {
                room.startGame();
            }*/

            // Load Game
            if (data.dataType === LOAD_GAME){
                room.loadGame(data.roomId, data.turn, data.whitePlayer, data.isMyTurn, data.sender, data.iAmWhite);
            }
        });
    };

    /**
     * Load the game, notify player's about their turn
     */
    loadGame(roomId, turn, whitePlayer, isMyTurn, senderName, iAmWhite) {
        let thisRoom = this;
        //Create new Room with ID = roomID
        let loadRoom = new GameRoom(roomId, turn);
        let user;

        MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
            if (err) throw err;
            let dbo = db.db("webEchessDb");

            new Promise(function (resolve, reject) {
                resolve(dbo.collection("users").findOne({"username": senderName}));
            }).then(function (value) {
                return value.user;
            }).then(async function (value) {
                for(let i in thisRoom.users){
                    if(thisRoom.users[i].id === value){
                        user = thisRoom.users[i];
                    }
                }

                await loadRoom.addUser(user);

                if(isMyTurn){
                    console.log("[GameRoom] Load game with player " + senderName + "'s turn.");
                }

                // player who's turn it is, is notified with correct isMyTurn
                let gameLogicDataForPlayerTurn = {
                    dataType: GAME_LOGIC,
                    gameState: GAME_INIT,
                    isPlayerTurn: isMyTurn,
                    saveGame: false,
                    turn: turn,
                    iAmWhite : iAmWhite,
                    load: true
                };

                user.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));

                thisRoom.currentGameState = GAME_START;
            });
        });
    }

    /**
     * Start the game, choose player which starts the game and notify only this player
     */
    //startGame(userSession, dbUser) {
    startGame(user) {
        let room = this;
        //let game = room.addUserToGame(userSession, dbUser);
        let game = room.addUserToGame(user);
        if(game.state === G_START){
            // player 1 will start the game (white)
            //console.log("[Game] Start game with player " + game.users[1][1].username + "'s turn.");
            console.log("[Game] Start game with player " + game.users[1].socketId + "'s turn.");

            // send a message to black player
            let gameLogicDataForBlackPlayer = {
                dataType: GAME_LOGIC,
                gameState: GAME_INIT,
                isPlayerTurn: false,
                saveGame: false,
                turn: WHITE,
                load: false,
            };
            //let userBlack = game.users[0][0];
            let userBlack = game.users[0];
            console.log("black: ", userBlack);
            userBlack.socket.send(JSON.stringify(gameLogicDataForBlackPlayer));

            // white player is notified to start the game
            let gameLogicDataForWhitePlayer = {
                dataType: GAME_LOGIC,
                gameState: GAME_INIT,
                isPlayerTurn: true,
                saveGame: true,
                turn: WHITE,
                load: false,
            };
            //let userWhite = game.users[1][0];
            let userWhite = game.users[1];
            userWhite.socket.send(JSON.stringify(gameLogicDataForWhitePlayer));
        }
    }

    //addUserToGame(userSession, dbUser){
    addUserToGame(user){
        let room = this;
        let i = 0;
        for(let j in room.games){
            if(room.games[j].state === G_INIT){
                //room.games[j].addUserToGame(userSession, dbUser);
                room.games[j].addUserToGame(user);
                i = i + 1;
                return room.games[j];
            }
        }
        if(i === 0){
            let game = new Game();
            //game.addUserToGame(userSession, dbUser);
            game.addUserToGame(user);
            room.games.push(game);
            return game;
        }
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
        //games : [gameRoomIds, gameTimestamps, boards, fieldsCaptured, chatsHistory, turns, whitePlayer, isMyTurn, iAmWhite];
        let gameRoomIds = games[0];
        let gameTimestamps = games[1];
        let gameBoards = games[2];
        let gameFieldCaptured = games[3];
        let gameChatHistory = games[4];
        let gameTurns = games[5];
        let gameWhitePlayers = games[6];
        let gameIsMyTurns = games[7];
        let gameIAmWhites = games[8];
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
            gameRoomIds : gameRoomIds,
            timestamps : gameTimestamps,
            boards : gameBoards,
            fieldsCaptured : gameFieldCaptured,
            chatsHistory : gameChatHistory,
            turns : gameTurns,
            whitePlayers : gameWhitePlayers,
            isMyTurns : gameIsMyTurns,
            iAmWhites : gameIAmWhites
        };
        currentUser.socket.send(JSON.stringify(savedGames));
    }
}