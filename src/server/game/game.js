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

    addUserToGame(user){
        if(this.users.length < 2){
            this.users.push(user);
            if(this.users.length === 2){
                this.state = START;
            }
        }
        else{
            let game = new Game();
            game.addUserToGame(user);
        }
    }

    endGame(){
        this.state = END;
    }
}