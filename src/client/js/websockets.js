let websocketGame = {
    isDrawing : false,
    startX : 0,
    startY : 0,
    LINE_SEGMENT : 0,
    CHAT_MESSAGE : 1,
    GAME_LOGIC : 2,
    WAITING_TO_START : 0,
    GAME_START : 1,
    GAME_OVER : 2,
    GAME_RESTART : 3,
    isTurnToDraw: false,
};


$(function(){
    if(window["WebSocket"]){
        // crate connection
        websocketGame.socket = new WebSocket("ws://127.0.0.1:8000");

        // on open event
        websocketGame.socket.onopen = function(e){
            console.log('WebSocket connection established.');
        };

        // on message event (executed when receiving a message from server)
        websocketGame.socket.onmessage = function(e){
            console.log("Got message: ", e.data);
            let data = JSON.parse(e.data);
            if(data.dataType === websocketGame.CHAT_MESSAGE){
                $("#chat-history").append("<li>" + data.sender + " said: " + data.message + "</li>");
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

$("#restart").hide();
$("#restart").click(function(){
    canvas.width = canvas.width;
    $("#chat-history").html("");
    $("#chat-history").append("<li>Restarting Game.</li>");

    let data = {};
    data.dataType = websocketGame.GAME_LOGIC;
    data.gameState = websocketGame.GAME_RESTART;
    websocketGame.socket.send(JSON.stringify(data));

    $("#restart").hide();
});