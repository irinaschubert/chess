/** Class representing the knight piece
 *  @author Irina
 *  @extends Piece
 * */
import Piece from './piece.js';

export default class Knight extends Piece {
    /**
     * Create a knight piece
     * @param {color} color - can be black or white
     * @param {position} position - position on the board
     */
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    /**
     * Validates a move and returns an array of all touched fields
     * @param  {Array} from - the indexes of the from-field
     * @param  {Array} to - the indexes of the to-field
     * @return {Boolean} false if validation fails
     * @return {Array} an array of all touched fields if validation is successful
     */
    validateMove(from, to) {
        let distX = Math.abs(to[0] - from[0]);
        let distY = Math.abs(to[1] - from[1]);
        if (distX === 2 && distY === 1 || distX === 1 && distY === 2) {
            return true;
        } else {
            return false;
        }
    }
}