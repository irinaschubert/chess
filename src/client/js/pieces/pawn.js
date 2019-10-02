import Piece from './piece.js';

export default class Pawn extends Piece {
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    validateMove(from, to){
        let distX = to[0] - from[0];
        let distY = to[1] - from[1];
        if(this.color === "white"){
            if(distY === 1 && distX === 0){
                console.log("valid");
                return true;
            }
            else if(distY === 2 && distX === 0 && from[1] === 2){
                console.log("valid");
                return true;
            }
            else{
                console.log("not valid");
                return false;
            }
        }
        else if(this.color === "black"){
            if(distY === -1 && distX === 0){
                console.log("valid");
                return true;
            }
            else if(distY === -2 && distX === 0 && from[1] === 7){
                console.log("valid");
                return true;
            }
            else{
                console.log("not valid");
                return false;
            }
        }
    }
}