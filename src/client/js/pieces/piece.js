/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Piece{
    constructor(color, position){
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

