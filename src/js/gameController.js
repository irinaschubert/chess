/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Board from "./board.js";
import Piece from './pieces/piece.js';
/*import Bishop from '../pieces/bishop.js';
import King from '../pieces/king.js';
import Knight from '../pieces/knight.js';
import Pawn from '../pieces/pawn.js';
import Queen from '../pieces/queen.js';
import Rook from '../pieces/rook.js';*/

const $board = $('#board');
window.addEventListener("load", setupGame($board), false);

function setupGame(boardElement){
    let board = new Board(boardElement);
    board.createBoard();
    let pieces = [];
    pieces.push(new Piece("w_pawn_1", "pawn", "white", [2, 1]));
    pieces.push(new Piece("w_pawn_2", "pawn", "white", [2, 2]));
    pieces.push(new Piece("w_pawn_3", "pawn", "white", [2, 3]));
    pieces.push(new Piece("w_pawn_4", "pawn", "white", [2, 4]));
    pieces.push(new Piece("w_pawn_5", "pawn", "white", [2, 5]));
    pieces.push(new Piece("w_pawn_6", "pawn", "white", [2, 6]));
    pieces.push(new Piece("w_pawn_7", "pawn", "white", [2, 7]));
    pieces.push(new Piece("w_pawn_8", "pawn", "white", [2, 8]));
    pieces.push(new Piece("w_bishop_1", "bishop", "white", [1, 3]));
    pieces.push(new Piece("w_bishop_2", "bishop", "white", [1, 6]));
    pieces.push(new Piece("w_knight_1", "knight", "white", [1, 2]));
    pieces.push(new Piece("w_knight_2", "knight", "white", [1, 7]));
    pieces.push(new Piece("w_rook_1", "rook", "white", [1, 1]));
    pieces.push(new Piece("w_rook_2", "rook", "white", [1, 8]));
    pieces.push(new Piece("w_king", "king", "white", [1, 5]));
    pieces.push(new Piece("w_queen", "queen", "white", [1, 4]));
    pieces.push(new Piece("b_pawn_1", "pawn", "black", [7, 1]));
    pieces.push(new Piece("b_pawn_2", "pawn", "black", [7, 2]));
    pieces.push(new Piece("b_pawn_3", "pawn", "black", [7, 3]));
    pieces.push(new Piece("b_pawn_4", "pawn", "black", [7, 4]));
    pieces.push(new Piece("b_pawn_5", "pawn", "black", [7, 5]));
    pieces.push(new Piece("b_pawn_6", "pawn", "black", [7, 6]));
    pieces.push(new Piece("b_pawn_7", "pawn", "black", [7, 7]));
    pieces.push(new Piece("b_pawn_8", "pawn", "black", [7, 8]));
    pieces.push(new Piece("b_bishop_1", "bishop", "black", [8, 3]));
    pieces.push(new Piece("b_bishop_2", "bishop", "black", [8, 6]));
    pieces.push(new Piece("b_knight_1", "knight", "black", [8, 2]));
    pieces.push(new Piece("b_knight_2", "knight", "black", [8, 7]));
    pieces.push(new Piece("b_rook_1", "rook", "black", [8, 1]));
    pieces.push(new Piece("b_rook_2", "rook", "black", [8, 8]));
    pieces.push(new Piece("b_king", "king", "black", [8, 5]));
    pieces.push(new Piece("b_queen", "queen", "black", [8, 4]));
    pieces.forEach(placePieceOnBoard)
}

function placePieceOnBoard(piece){
    const i = piece.startPosition[0];
    const j = piece.startPosition[1];
    const $field = $(`.field[data-row = ${i}][data-col = ${j}]`);
    const $piece = $('<div>').addClass('piece');
    $piece.addClass(piece.type);
    $piece.addClass(piece.color);
    $piece.attr("id", piece.name);
    $piece.click(piece.move);
    $field.append($piece);

}




