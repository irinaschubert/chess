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
// condition
const CHECK = 1;
const CHECKMATE = 2;
//const CAPITULATE = 5;
// message
const FAILURE = 0;
const SUCCESS = 1;
// color
const WHITE = 1;
// game
const G_INIT = 0;
const G_START = 1;
const G_END = 2;
// win conditions
const WON = 0;
const LOST = 1;

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
    };

    /**
     * Handles user messages according to their type
     * @param  {User} user - sender
     */
    handleOnUserMessage(user) {
        let room = this;
        user.socket.on("message", function (message) {
            //use this for debugging
            //console.log("[GameRoom] Got message from " + user.socketId + ": " + message);

            let data = JSON.parse(message);

            // Chat message
            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.socketId;
                if(data.toAll === true){
                    room.sendAll(JSON.stringify(data));
                }
                else{
                    for(let i in room.games){
                        if(room.games[i].gameId === data.gameId){
                            for(let u in room.games[i].users){
                                room.games[i].users[u].socket.send(JSON.stringify(data));
                            }
                        }
                    }
                }
            }

            // Move message
            if (data.dataType === MOVE) {
                room.makeMove(user, data.from, data.to, data.gameId);
            }

            // Login message
            if (data.dataType === LOGIN) {
                let dbUser = { socketId: user.socketId, username: data.username, password: data.password};
                user.setUsername(data.username);

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
                            /*let updateUserId = new Promise(function (resolve, reject) {
                                resolve(dbo.collection("users").updateOne({"username": dbUser.username},{$set:{"userId": dbUser.socketId}}));
                            });*/

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
                let dbUser = { /*userId: user.socketId,*/ username: data.username, password: data.password};
                user.setUsername(dbUser.username);

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

            // Game over message
            if (data.dataType === GAME_LOGIC && data.gameState === GAME_OVER) {
                room.notifyAboutEnd(user, data.lostOrWon, data.gameId);
            }

            // Save the Game
            if (data.dataType === SAVE){
                let board = data.board;
                let fieldCaptured = data.fieldCaptured;
                let chatHistory = data.chatHistory;
                let timestamp = data.timestamp;
                let gameId = data.gameId;
                let userColor = data.userColor;
                let turnColor = userColor + 1 % 2;

                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    let updateSave = new Promise(async function(resolve, reject){
                        let result = await (dbo.collection("savedGames").findOne({"gameId": gameId}));
                        if(result === null){
                            //when game is saved for the first time
                            resolve([turnColor,user.username]);
                        }
                        else{
                            //when game exists, replace last saved game
                            resolve([result.turn,result.whitePlayer,result.users]);
                        }

                    });

                    updateSave.then( async function(value){
                        let turn = value[0];
                        //change turn each time game is saved by active player
                        let newTurn = (turn + 1) % 2;
                        let whitePlayer = value[1];
                        let users = [];
                        if(value[2] !== undefined){
                            users = value[2];
                        }

                        for(let i in room.games){
                            if(room.games[i].gameId === gameId){
                                if(users === []){
                                    users = [room.games[i].users[0].username];
                                }
                                else{
                                    users = [room.games[i].users[0].username, room.games[i].users[1].username];
                                }
                            }
                        }

                        dbo.collection("savedGames").updateOne(
                            {"gameId" : gameId},
                            {$set:{
                                    "gameId": gameId, "users": users, "board": board, "fieldCaptured": fieldCaptured, "chatHistory": chatHistory, "timestamp": timestamp, "turn": newTurn, "whitePlayer": whitePlayer,
                                }},
                            { upsert: true });

                    });
                });
            }

            // Load
            if (data.dataType === LOAD) {
                // return all games where loadUser is involved
                MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");

                    new Promise(function (resolve, reject) {
                        resolve(dbo.collection("savedGames").find({"users": user.username}));
                    }).then(async function (value) {
                        let gameIds = [];
                        let boards = [];
                        let fieldsCaptured = [];
                        let chatsHistory = [];
                        let gameTimestamps = [];
                        let turns = [];
                        let whitePlayer = [];
                        let isMyTurn = [];
                        let username = user.username;
                        let iAmWhite = [];
                        let users = [];

                        while (await value.hasNext()){
                            let item = await value.next();
                            if (item !== null) {
                                gameIds.push(item.gameId);
                                boards.push(item.board);
                                chatsHistory.push(item.chatHistory);
                                fieldsCaptured.push(item.fieldCaptured);
                                gameTimestamps.push(item.timestamp);
                                turns.push(item.turn);
                                whitePlayer.push(item.whitePlayer);
                                users.push(item.users);
                                if(username === item.whitePlayer){
                                    iAmWhite.push(true);
                                }
                                else{
                                    iAmWhite.push(false);
                                }
                                if(username === item.whitePlayer && item.turn === 1){
                                    isMyTurn.push(true);
                                }else if(username === item.whitePlayer && item.turn === 0){
                                    isMyTurn.push(true)
                                }else{
                                    isMyTurn.push(false)
                                }
                            }
                        }
                        return [gameIds, gameTimestamps, boards, fieldsCaptured, chatsHistory, turns, whitePlayer, isMyTurn, iAmWhite, users];
                    }).then(function (value) {
                        db.close();
                        room.showSavedGamesForUser(user, value);
                    });
                });
            }

            // New Game
            if (data.dataType === NEW) {
                room.startGame(user);
            }

            // Load Game
            if (data.dataType === LOAD_GAME){
                room.loadGame(user, data.gameId, data.turn, data.whitePlayer, data.isMyTurn, data.iAmWhite);
            }
        });
    };

    /**
     * Load the game, notify player's about their turn
     */
    loadGame(user, gameId, turn, whitePlayer, isMyTurn, iAmWhite) {
        let game;
        //Check if game is already open
        let j = 0;
        for(let i in this.games){
            if(this.games[i].gameId === gameId && this.games[i].state === G_START){
                game = this.games[i];
                game.addUserToGameLoad(user);
                j = j + 1;
            }
        }

        //Create new Game
        if(j < 1){
            game = new Game();
            game.setGameId(gameId);
            game.addUserToGameLoad(user);
            game.setGameState(G_START);
            this.games.push(game);
        }

        if(isMyTurn){
            console.log("[GameRoom] Load game with player " + user.username + "'s turn.");
        }

        // player who's turn it is, is notified with correct isMyTurn
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_INIT,
            isPlayerTurn: isMyTurn,
            saveGame: false,
            turn: turn,
            iAmWhite : iAmWhite,
            load: true,
            gameId: gameId
        };

        user.socket.send(JSON.stringify(gameLogicDataForPlayerTurn));
    }

    /**
     * Start the game, choose player which starts the game and notify only this player
     */
    startGame(user) {
        let room = this;
        let game = room.addUserToGame(user);
        if (game.state === G_START) {
            // player 1 will start the game (white)
            console.log("[Game] Start game with player " + user.username + "'s turn.");

            // send a message to black player
            let gameLogicDataForBlackPlayer = {
                dataType: GAME_LOGIC,
                gameState: GAME_INIT,
                gameId: game.gameId,
                isPlayerTurn: false,
                saveGame: false,
                turn: WHITE,
                load: false,
                message: "Wait for another user..."
            };
            let userBlack = game.users[0];
            userBlack.socket.send(JSON.stringify(gameLogicDataForBlackPlayer));

            // white player is notified to start the game
            let gameLogicDataForWhitePlayer = {
                dataType: GAME_LOGIC,
                gameState: GAME_INIT,
                gameId: game.gameId,
                isPlayerTurn: true,
                saveGame: true,
                turn: WHITE,
                load: false,
            };
            let userWhite = game.users[1];
            userWhite.socket.send(JSON.stringify(gameLogicDataForWhitePlayer));
        }
    }

    addUserToGame(user){
        let room = this;
        let i = 0;
        for(let j in room.games){
            if(room.games[j].state === G_INIT){
                room.games[j].addUserToGame(user);
                i = i + 1;

               /* MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                    if (err) throw err;
                    let dbo = db.db("webEchessDb");
                    dbo.collection("games").insertOne({"gameId": room.games[j].gameId, "gameState": room.games[j].state, "username": user.username})
                        .then(dbo.collection("games").updateOne({"gameId": room.games[j].gameId, "username": user.username}, {$set:{"gameState": G_START}}))
                        .then(db.close());
                });*/
                return room.games[j];
            }
        }
        if(i === 0){
            let game = new Game();
            game.addUserToGame(user);
            room.games.push(game);

            /*MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                if (err) throw err;
                let dbo = db.db("webEchessDb");
                dbo.collection("games").insertOne({"gameId": game.gameId, "gameState": game.state, "username": user.username})
                    .then(db.close());
            });*/
            return game;
        }
    }

    /**
     * Move pieces and notify players about their turn
     */
    makeMove(user, from, to, gameId){
        let room = this;
        let currentUsername = user.username;
        let currentUser;
        let currentUsers = [];
        let nextUser;
        let nextUsers = [];
        for (let i = 0; i < room.games.length; i++) {
            if(room.games[i].gameId === gameId){
                for(let j in room.games[i].users){
                    if(room.games[i].users[j].username === currentUsername){
                        currentUser = room.games[i].users[j];
                        currentUsers.push(currentUser);
                    }
                    else{
                        nextUser = room.games[i].users[j];
                        nextUsers.push(nextUser);
                    }
                }
            }
        }

        let moveData = {
            dataType: MOVE,
            from: from,
            to: to,
        };

        for(let i in currentUsers){
            currentUsers[i].socket.send(JSON.stringify(moveData));
        }
        for(let i in nextUsers){
            if(nextUsers[i] !== undefined){
                nextUsers[i].socket.send(JSON.stringify(moveData));
            }
        }

        // player who just moved, is sent a message with isPlayerTurn: false
        let gameLogicDataForPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: false,
        };
        for(let i in currentUsers){
            currentUsers[i].socket.send(JSON.stringify(gameLogicDataForPlayerTurn));
        }

        // player who's turn it is, is notified with isPlayerTurn: true
        let gameLogicDataForNextPlayerTurn = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: true,
        };
        for(let i in nextUsers){
            if(nextUsers[i] !== undefined){
                nextUsers[i].socket.send(JSON.stringify(gameLogicDataForNextPlayerTurn));
            }
        }
    }

    /**
     * Show saved games for current user
     */
    showSavedGamesForUser(user, games){
        let room = this;
        let gameIds = games[0];
        let gameTimestamps = games[1];
        let gameBoards = games[2];
        let gameFieldCaptured = games[3];
        let gameChatHistory = games[4];
        let gameTurns = games[5];
        let gameWhitePlayers = games[6];
        let gameIsMyTurns = games[7];
        let gameIAmWhites = games[8];
        let currentUsername = user.username;
        let currentUser;
        let users = games[9];

        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if(user.username === currentUsername){
                currentUser = user;
            }
        }

        let savedGames = {
            dataType: SHOW_GAMES,
            gameIds : gameIds,
            timestamps : gameTimestamps,
            boards : gameBoards,
            fieldsCaptured : gameFieldCaptured,
            chatsHistory : gameChatHistory,
            turns : gameTurns,
            whitePlayers : gameWhitePlayers,
            isMyTurns : gameIsMyTurns,
            iAmWhites : gameIAmWhites,
            users : users
        };
        currentUser.socket.send(JSON.stringify(savedGames));
    }

    notifyAboutEnd(user, lostOrWon, gameId){
        let room = this;
        let currentUsername = user.username;
        let currentUser;
        let currentUsers = [];
        let nextUser;
        let nextUsers = [];

        for (let i = 0; i < room.games.length; i++) {
            if(room.games[i].gameId === gameId){
                room.games[i].state === G_END;
                for(let j in room.games[i].users){
                    if(room.games[i].users[j].username === currentUsername){
                        currentUser = room.games[i].users[j];
                        currentUsers.push(currentUser);
                    }
                    else{
                        nextUser = room.games[i].users[j];
                        nextUsers.push(nextUser);
                    }
                }
            }
        }

        let dataWinner = {
            dataType: GAME_LOGIC,
            gameState: GAME_OVER,
            message: WON
        };

        let dataLoser = {
            dataType: GAME_LOGIC,
            gameState: GAME_OVER,
            message: LOST
        };

        if(lostOrWon === WON){
            for(let i in currentUsers){
                currentUsers[i].socket.send(JSON.stringify(dataWinner));
            }
            for(let i in nextUsers){
                if(nextUsers[i] !== undefined){
                    nextUsers[i].socket.send(JSON.stringify(dataLoser));
                }
            }
        }

        else{
            for(let i in currentUsers){
                currentUsers[i].socket.send(JSON.stringify(dataLoser));
            }
            for(let i in nextUsers){
                if(nextUsers[i] !== undefined){
                    nextUsers[i].socket.send(JSON.stringify(dataWinner));
                }
            }
        }
    }
}