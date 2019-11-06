/** Class representing the bishop piece
 *  @author Irina
 *  @extends Piece
 * */
import Piece from './piece.js';

export default class Bishop extends Piece {
    /**
     * Create a bishop piece
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
        if(Math.abs(distX) !== Math.abs(distY)){
            console.log("not valid");
            return false;
        }
        else{
            let touchedFields = [];
            // move right up
            if(distX > 0 && distY > 0){
                for(let i = 1 ; i < distX; i++){
                    touchedFields.push([from[0]+i,from[1]+i]);
                }
                return touchedFields;
            }
            // move right down
            else if(distX > 0 && distY < 0){
                for(let i = 1 ; i < distX; i++){
                    touchedFields.push([from[0]+i,from[1]-i]);
                }
                return touchedFields;
            }

            // move left down
            else if(distX < 0 && distY < 0){
                for(let i = 1 ; i < Math.abs(distX); i++){
                    touchedFields.push([from[0]-i,from[1]-i]);
                }
                return touchedFields;
            }

            // move left up
            else if(distX < 0 && distY > 0){
                for(let i = 1 ; i < Math.abs(distX); i++){
                    touchedFields.push([from[0]-i,from[1]+i]);
                }
                return touchedFields;
            }
        }
    }
}