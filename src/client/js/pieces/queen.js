import Piece from './piece.js';

export default class Queen extends Piece {
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
    validateMove(from, to){
        let distX = to[0] - from[0];
        let distY = to[1] - from[1];
        if(Math.abs(distX) !== Math.abs(distY) && (from[0] !== to[0] && from[1] !== to[1])){
            return false;
        }
        else if(Math.abs(distX) === Math.abs(distY)){
            let touchedFields = [];
            // move diagonally right up
            if(distX > 0 && distY > 0){
                for(let i = 1 ; i < distX; i++){
                    touchedFields.push([from[0]+i,from[1]+i]);
                }
                return touchedFields;
            }
            // move diagonally right down
            else if(distX > 0 && distY < 0){
                for(let i = 1 ; i < distX; i++){
                    touchedFields.push([from[0]+i,from[1]-i]);
                }
                return touchedFields;
            }

            // move diagonally left down
            else if(distX < 0 && distY < 0){
                for(let i = 1 ; i < Math.abs(distX); i++){
                    touchedFields.push([from[0]-i,from[1]-i]);
                }
                return touchedFields;
            }

            // move diagonally left up
            else if(distX < 0 && distY > 0){
                for(let i = 1 ; i < Math.abs(distX); i++){
                    touchedFields.push([from[0]-i,from[1]+i]);
                }
                return touchedFields;
            }
        }
        else if(from[0] === to[0] || from[1] === to[1]){
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