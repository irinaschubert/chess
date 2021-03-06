/** Class representing the board
 *  @author Irina
 * */

'use strict';

export default class Board{
    /**
     * Create a bishop piece
     * @param {jQuery} boardElement - jQuery element which represents the board
     */
    constructor(boardElement){
        this.boardElement = boardElement;
    }

    /**
     * Create the board
     */
    createBoard() {
        this.rows = 8;
        this.cols = 8;

        this.boardElement.empty();

        for (let i = this.rows; i > 0; i--) {
            const $row = $('<div>').addClass('row');
            for (let j = 1; j <= this.cols; j++) {
                const $field = $('<div>')
                    .addClass('field')
                    .attr('data-row', i)
                    .attr('data-col', j);
                if( i % 2 === 0 && j % 2 === 0 ){ $field.addClass('bg-black') }
                else if( i % 2 === 0 && j % 2 !== 0 ){ $field.addClass('bg-white') }
                else if( i % 2 !== 0 && j % 2 === 0 ){ $field.addClass('bg-white') }
                else if( i % 2 !== 0 && j % 2 !== 0 ){ $field.addClass('bg-black') }
                if( i === 1 ){
                    const $div = $('<div>').addClass('first-row');
                    let letter = (j+9).toString(36);
                    $div.text(letter);
                    $field.append($div);
                }
                if( j === 1){
                    const $div = $('<div>').addClass('first-column');
                    $div.text(i);
                    $field.append($div);
                }

                $row.append($field);
            }
            this.boardElement.append($row);
        }
    }
}

