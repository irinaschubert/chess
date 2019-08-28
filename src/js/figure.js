export default class Figure{
    constructor(type, color, startPositionI, startPositionJ){
        this.type = type;
        this.color = color;
        this.startPositionI = startPositionI;
        this.startPositionJ = startPositionJ;
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

    initialize() {
        const $startfield = $(`.field[data-row=${this.startPositionI}][data-col=${this.startPositionJ}]`);
        $startfield.addClass(this.type);
        $startfield.addClass(this.color);
    }
}

