/** Class representing a game
 *  @author Irina
 * */

'use strict';

// states
const INIT = 0;
const START = 1;
const END = 2;

export default class Game {
    /**
     * Create a game
     */
    constructor(){
        // creates a random id for the game
        this.gameId = "1" + Math.floor(Math.random() * 1000000000)
        this.users = [];
        this.state = INIT;
    }

    // Add user to game if new game is created
    addUserToNewGame(user){
        if(this.users.length < 2){
            this.users.push(user);
            if(this.users.length === 2){
                this.setGameState(START);
            }
        }
        else{
            let game = new Game();
            game.addUserToNewGame(user);
        }
    }

    // Add user to game if game is loaded
    addUserToGameLoad(user){
        this.users.push(user);
    }

    // set state correctly when game ends
    endGame(){
        this.state = END;
    }

    setGameId(id){
        this.gameId = id;
    }

    getGameState(){
        return this.state;
    }

    setGameState(state){
        this.state = state;
    }
}