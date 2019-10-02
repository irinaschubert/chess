const LINE_SEGMENT = 0;
const CHAT_MESSAGE = 1;
const GAME_LOGIC = 2;
const WAITING_TO_START = 0;
const GAME_START = 1;
const GAME_OVER = 2;
const GAME_RESTART = 3;

function User(socket){
    this.socket = socket;
    // creates a random id for the connection
    this.id = "1" + Math.floor(Math.random() * 1000000000)
}

function Room() {
    this.users = [];

    Room.prototype.addUser = function (user) {
        this.users.push(user);
        let room = this;

        let data = {
            dataType : CHAT_MESSAGE,
            sender : "Server",
            message: user.id + " has joined the game. Total connections: " + this.users.length
        };

        room.sendAll(JSON.stringify(data));

        user.socket.onclose = function () {
            console.log(user.id + ' left.');
            room.removeUser(user);
        };

        this.handleOnUserMessage(user);
    };

    Room.prototype.removeUser = function (user) {
        for (let i = this.users.length; i >= 0; i--) {
            if (this.users[i] === user) {
                this.users.splice(i, 1);
            }
        }
    };

    Room.prototype.sendAll = function (message) {
        for (let i = 0, len = this.users.length; i < len; i++) {
            this.users[i].socket.send(message);
        }
    };

    Room.prototype.handleOnUserMessage = function(user){
        let room = this;
        user.socket.on("message", function (message) {
            console.log("Receive message from " + user.id + ": " + message);

            let data = JSON.parse(message);
            if(data.dataType === CHAT_MESSAGE){
                data.sender = user.id;
            }
            room.sendAll(JSON.stringify(data));
        });
    }
}
GameRoom.prototype = new Room();

function GameRoom(){
    this.playerTurn = 0;
    this.wordsList = ['apple', 'idea', 'wisdom', 'angry'];
    this.currentAnswer = undefined;
    this.currentGameState = WAITING_TO_START;

    let gameLogicData = {
        dataType: GAME_LOGIC,
        gameState: WAITING_TO_START,
    };

    this.sendAll(JSON.stringify(gameLogicData));

    GameRoom.prototype.addUser = function(user){
        Room.prototype.addUser.call(this, user);

        if(this.currentGameState === WAITING_TO_START && this.users.length >= 2){
            this.startGame();
        }
    };

    GameRoom.prototype.handleOnUserMessage = function(user){
        let room = this;
        user.socket.on("message", function (message) {
            console.log("[GameRoom] Receive message from " + user.id + ": " + message);

            let data = JSON.parse(message);

            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.id;
            }
            room.sendAll(JSON.stringify(data));

            if (data.dataType === CHAT_MESSAGE) {
                data.sender = user.id;
                console.log("Current state: " + room.currentGameState);

                if(room.currentGameState === GAME_START){
                    console.log("Got message: " + data.message + " (Answer: " + room.currentAnswer + ")");
                }

                if (room.currentGameState === GAME_START && data.message === room.currentAnswer) {
                    let gameLogicData = {
                        dataType: GAME_LOGIC,
                        gameState: GAME_OVER,
                        winner: user.id,
                        answer: room.currentAnswer,
                    };

                    room.sendAll(JSON.stringify(gameLogicData));
                    room.currentGameState = WAITING_TO_START;

                    clearTimeout(room.gameOverTimeout);
                }
            }

            if(data.dataType === GAME_LOGIC && data.gameState === GAME_RESTART){
                room.startGame();
            }

        });
    };

    GameRoom.prototype.startGame = function(){
        let room = this;

        this.playerTurn = (this.playerTurn + 1) % this.users.length;

        console.log("Start game with player " + this.playerTurn + "'s turn.");

        let answerIndex = Math.floor(Math.random() * this.wordsList.length);
        this.currentAnswer = this.wordsList[answerIndex];

        let gameLogicDataForAllPlayers = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            isPlayerTurn: false,
        };

        this.sendAll(JSON.stringify(gameLogicDataForAllPlayers));

        let gameLogicDataForDrawer = {
            dataType: GAME_LOGIC,
            gameState: GAME_START,
            answer: this.currentAnswer,
            isPlayerTurn: true,
        };

        let user = this.users[this.playerTurn];
        user.socket.send(JSON.stringify(gameLogicDataForDrawer));

        gameOverTimeout = setTimeout(function(){
            let gameLogicData = {
                dataType: GAME_LOGIC,
                gameState: GAME_OVER,
                winner: "No one",
                answer: room.currentAnswer,
            };

            room.sendAll(JSON.stringify(gameLogicData));

            room.currentGameState = WAITING_TO_START;
        }, 60*1000);

        room.currentGameState = GAME_START;
    }
}

module.exports.User = User;
module.exports.Room = Room;
module.exports.GameRoom = GameRoom;