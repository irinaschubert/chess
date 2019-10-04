import Piece from './piece.js';

export default class Pawn extends Piece {
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    validateMove(from, to){
        let distX = to[0] - from[0];
        let distY = to[1] - from[1];

        let touchedFields = [];



        if(this.color === "white"){
            // capture another piece diagonally
            if(distX === 1 && distY === 1){
                return touchedFields;
            }
            if(distX === -1 && distY === 1){
                return touchedFields;
            }
            // move one forward
            if(distY === 1 && distX === 0){
                return touchedFields;
            }
            // allow move of 2 when on start position
            else if(distY === 2 && distX === 0 && from[1] === 2){
                touchedFields.push([from[0],from[1]+1]);
                return touchedFields;
            }
            else{
                return false;
            }
        }

        else if(this.color === "black"){
            // capture another piece diagonally
            if(distX === 1 && distY === -1){
                return touchedFields;
            }
            if(distX === -1 && distY === -1){
                return touchedFields;
            }
            // move one forward
            if(distY === -1 && distX === 0){
                return touchedFields;
            }
            // allow move of 2 when on start position
            else if(distY === -2 && distX === 0 && from[1] === 7){
                touchedFields.push([from[0],from[1]-1]);
                return touchedFields;
            }
            else{
                return false;
            }
        }
    }
}