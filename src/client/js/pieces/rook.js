import Piece from './piece.js';

export default class Rook extends Piece {
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    validateMove(from, to){
        if(from[0] === to[0] | from[1] === to[1]){
            console.log("valid");
            return true;
        }
        else{
            console.log("not valid");
            return false;
        }
    }
}