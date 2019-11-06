/** Class representing the king piece
 *  @author Irina
 *  @extends Piece
 * */
import Piece from './piece.js';

export default class King extends Piece {
    /**
     * Create a king piece
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
        let distX = Math.abs(to[0] - from[0]);
        let distY = Math.abs(to[1] - from[1]);
        if(distX === 1 || distY === 1){
            console.log("valid");
            return true;
        }
        else{
            console.log("not valid");
            return false;
        }
    }
}