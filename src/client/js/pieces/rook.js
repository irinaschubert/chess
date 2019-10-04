import Piece from './piece.js';

export default class Rook extends Piece {
    constructor(color, position){
        super(color, position);
        this.validateMove = this.validateMove.bind(this);
    }

    /**
     * validates a move and returns an array of all touched fields
     * @param  {Array} from - the indexes of the from-field
     * @param  {Array} to - the indexes of the to-field
     * @return {Boolean} false if validation fails
     * @return {Array} an array of all touched fields
     */
    // validates a move and returns an array of all touched fields
    validateMove(from, to){
        if(from[0] !== to[0] && from[1] !== to[1]){
            return false;
        }
        else{
            let touchedFields = [];
            // move vertically
            if(from[0] === to[0]){
                let distance = to[1] - from[1];
                if(distance < 0){
                    for(let i = distance + 1; i < 0; i++){
                        touchedFields.push([from[0],from[1]+i]);
                    }
                    return touchedFields;
                }
                else{
                    for(let i = 1; i < distance; i++){
                        touchedFields.push([from[0],from[1]+i]);
                    }
                    return touchedFields;
                }
            }
            // move horizontally
            else if(from[1] === to[1]){
                let distance = to[0] - from[0];
                if(distance < 0){
                    for(let i = distance + 1; i < 0; i++){
                        touchedFields.push([from[0]+i,from[1]]);
                    }
                    return touchedFields;
                }
                else{
                    for(let i = 1; i < distance; i++){
                        touchedFields.push([from[0]+i,from[1]]);
                    }
                    return touchedFields;
                }
            }
        }
    }
}