/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Piece{
    constructor(name, type, color, startPositionI, startPositionJ){
        this._name = name;
        this._type = type;
        this._color = color;
        this._startPositionI = startPositionI;
        this._startPositionJ = startPositionJ;
        this.move = this.move.bind(this);
    }

    move(){
        return console.log("hello, I am ", this.name);
    }

    get name(){
        return this._name;
    }

    set name(name){
        this._name = name;
    }

    get startPositionI(){
        return this._startPositionI;
    }

    set startPositionI(startPositionI){
        this._startPositionI = startPositionI;
    }

    get startPositionJ(){
        return this._startPositionJ;
    }

    set startPositionJ(startPositionJ){
        this._startPositionJ = startPositionJ;
    }

    get type(){
        return this._type;
    }

    set type(type){
        this._type = type;
    }

    get color(){
        return this._color;
    }

    set color(color){
        this._color = color;
    }

    getAllowedMoves(){

    }
}

