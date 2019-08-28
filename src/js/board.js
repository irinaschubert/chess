const $board = $('#board');

export default class Board{
    createBoard(board) {
        this.rows = 8;
        this.cols = 8;

        board.empty();

        for (let i = this.rows; i > 0; i--) {
            const $row = $('<div>').addClass('row');
            for (let j = 1; j <= this.cols; j++) {
                const $field = $('<div>')
                    .addClass('field')
                    .attr('data-row', i)
                    .attr('data-col', j);
                if( i % 2 === 0 && j % 2 === 0 ){ $field.addClass('white') }
                else if( i % 2 === 0 && j % 2 !== 0 ){ $field.addClass('black') }
                else if( i % 2 !== 0 && j % 2 === 0 ){ $field.addClass('black') }
                else if( i % 2 !== 0 && j % 2 !== 0 ){ $field.addClass('white') }
                if( i === 1 ){
                    let letter = (j+9).toString(36);
                    $field.text(letter);
                }
                if( j == 1){
                    $field.text(i);
                }

                $row.append($field);
            }
            board.append($row);
        }
    }
}

