import Piece from './piece.js';

export default class King extends Piece {
    constructor(color, startPosition){
        super(color, startPosition);
        this.move = this.move.bind(this);
    }

    move(){
        console.log("hello, I am a ", this.constructor.name);
        console.log("my start position is: ", super.getPosition())
    }

    isMovePossible(src, dest){
        return null;
    }
}