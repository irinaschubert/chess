/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

export default class Piece{
    constructor(name, type, color, startPositionI, startPositionJ){
        this.name = name;
        this.type = type;
        this.color = color;
        this.startPositionI = startPositionI;
        this.startPositionJ = startPositionJ;
    }

    getName(){
        return this.name;
    }

    getStartPositionI(){
        return this.startPositionI;
    }

    getStartPositionJ(){
        return this.startPositionJ;
    }

    getType(){
        return this.type;
    }

    getColor(){
        return this.color;
    }
}

