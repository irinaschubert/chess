/** Class representing the pawn piece
 *  @author Irina
 *  @extends Piece
 * */
import Piece from './piece.js';

export default class Pawn extends Piece {
    /**
     * Create a pawn piece
     * @param {string} color - can be black or white
     * @param {number[]} position - position on the board
     */
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    /**
     * Validates a move and returns an array of all touched fields
     * @param  {int[]} from - the indexes of the from-field
     * @param  {int[]} to - the indexes of the to-field
     * @return {Boolean} false if validation fails
     * @return {Array} an array of all touched fields if validation is successful
     */
    validateMove(from, to){
        let distX = to[0] - from[0];
        let distY = to[1] - from[1];

        let touchedFields = [];

        if(this.color === "white"){
            // move diagonally
            if(distX === 1 && distY === 1){
                return touchedFields;
            }
            if(distX === -1 && distY === 1){
                return touchedFields;
            }
            // move one forward, add to-field to touchedFields as piece is not allowed to step on that field if already occupied
            if(distY === 1 && distX === 0){
                touchedFields.push([from[0],from[1]+1]);
                return touchedFields;
            }
            // allow move of 2 from start position, add to-field to touchedFields as piece is not allowed to step on that field if already occupied
            else if(distY === 2 && distX === 0 && from[1] === 2){
                touchedFields.push([from[0],from[1]+1]);
                touchedFields.push([from[0],from[1]+2]);
                return touchedFields;
            }
            else{
                return false;
            }
        }

        else if(this.color === "black"){
            // move diagonally
            if(distX === 1 && distY === -1){
                return touchedFields;
            }
            if(distX === -1 && distY === -1){
                return touchedFields;
            }
            // move one forward, add to-field to touchedFields as piece is not allowed to step on that field if already occupied
            if(distY === -1 && distX === 0){
                touchedFields.push([from[0],from[1]-1]);
                return touchedFields;
            }
            // allow move of 2 from start position, add to-field to touchedFields as piece is not allowed to step on that field if already occupied
            else if(distY === -2 && distX === 0 && from[1] === 7){
                touchedFields.push([from[0],from[1]-1]);
                touchedFields.push([from[0],from[1]-2]);
                return touchedFields;
            }
            else{
                return false;
            }
        }
    }
}