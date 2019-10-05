/** Class representing the piece
 *  @author Irina
 *  @abstract
 * */

'use strict';

export default class Piece{
    constructor(color, position){
        /**
         * Abstract, cannot be created directly
         * @param {color} color - can be black or white
         * @param {position} position - position on the board
         */
        if (new.target === Piece) {
            throw new TypeError("Cannot construct Piece instances directly.");
        }
        this._color = color;
        this._position = position;
    }

    get color(){
        return this._color;
    }

    set color(color){
        this._color = color;
    }

    get position(){
        return this._position;
    }

    set position(position){
        this._position = position;
    }
}

