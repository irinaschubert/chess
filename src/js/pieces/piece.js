/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Piece{
    constructor(name, type, color, startPosition){
        this._name = name;
        this._type = type;
        this._color = color;
        this._startPosition = startPosition;
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

    get startPosition(){
        return this._startPosition;
    }

    set startPosition(startPosition){
        this._startPosition = startPosition;
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
}

