/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Piece{
    constructor(color, startPosition){
        this._color = color;
        this._startPosition = startPosition;
    }

    get color(){
        return this._color;
    }

    set color(color){
        this._color = color;
    }

    get startPosition(){
        return this._startPosition;
    }

    set startPosition(startPosition){
        this._startPosition = startPosition;
    }
}

