import Piece from './piece.js';

export default class Knight extends Piece {
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    validateMove(from, to) {
        let distX = Math.abs(to[0] - from[0]);
        let distY = Math.abs(to[1] - from[1]);
        if (distX === 2 && distY === 1 || distX === 1 && distY === 2) {
            console.log("valid");
            return true;
        } else {
            console.log("not valid");
            return false;
        }
    }
}