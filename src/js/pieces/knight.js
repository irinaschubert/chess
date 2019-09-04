import Piece from './piece.js';

export default class Knight extends Piece {
    constructor(color, startPosition){
        super(color, startPosition);
        this.move = this.move.bind(this);
    }

    move(){
        return console.log("hello, I am a ", this.constructor.name);
    }

    isMovePossible(src, dest){
        return null;
    }
}