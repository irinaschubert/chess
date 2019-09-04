import Piece from './piece.js';

export default class Queen extends Piece {
    constructor(color, startPosition){
        super(color, startPosition);
        this.prepareForMove = this.prepareForMove.bind(this);
    }

    prepareForMove(){
        let src = super.getPosition();
        console.log("my actual position is: ", super.getPosition());
    }

    isMovePossible(src, dest){
        return null;
    }
}