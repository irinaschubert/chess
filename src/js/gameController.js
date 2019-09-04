/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Board from "./board.js";
import Bishop from './pieces/bishop.js';
import King from './pieces/king.js';
import Knight from './pieces/knight.js';
import Pawn from './pieces/pawn.js';
import Queen from './pieces/queen.js';
import Rook from './pieces/rook.js';

const $board = $('#board');
window.addEventListener("load", setupGame($board), false);

function setupGame(boardElement){
    let board = new Board(boardElement);
    board.createBoard();
    let pieces = [];
    pieces.push(new Pawn("white", [2, 1]));
    pieces.push(new Pawn("white", [2, 2]));
    pieces.push(new Pawn("white", [2, 3]));
    pieces.push(new Pawn("white", [2, 4]));
    pieces.push(new Pawn("white", [2, 5]));
    pieces.push(new Pawn("white", [2, 6]));
    pieces.push(new Pawn("white", [2, 7]));
    pieces.push(new Pawn("white", [2, 8]));
    pieces.push(new Bishop("white", [1, 3]));
    pieces.push(new Bishop("white", [1, 6]));
    pieces.push(new Knight("white", [1, 2]));
    pieces.push(new Knight("white", [1, 7]));
    pieces.push(new Rook("white", [1, 1]));
    pieces.push(new Rook("white", [1, 8]));
    pieces.push(new King("white", [1, 5]));
    pieces.push(new Queen("white", [1, 4]));
    pieces.push(new Pawn("black", [7, 1]));
    pieces.push(new Pawn("black", [7, 2]));
    pieces.push(new Pawn("black", [7, 3]));
    pieces.push(new Pawn("black", [7, 4]));
    pieces.push(new Pawn("black", [7, 5]));
    pieces.push(new Pawn("black", [7, 6]));
    pieces.push(new Pawn("black", [7, 7]));
    pieces.push(new Pawn("black", [7, 8]));
    pieces.push(new Bishop("black", [8, 3]));
    pieces.push(new Bishop("black", [8, 6]));
    pieces.push(new Knight("black", [8, 2]));
    pieces.push(new Knight("black", [8, 7]));
    pieces.push(new Rook("black", [8, 1]));
    pieces.push(new Rook("black", [8, 8]));
    pieces.push(new King("black", [8, 5]));
    pieces.push(new Queen("black", [8, 4]));
    pieces.forEach(placePieceOnBoard)
}

function placePieceOnBoard(piece){
    const i = piece.startPosition[0];
    const j = piece.startPosition[1];
    const $field = $(`.field[data-row = ${i}][data-col = ${j}]`);
    const $piece = $('<div>').addClass('piece');
    $piece.addClass(piece.constructor.name.toLowerCase());
    $piece.addClass(piece.color);
    $piece.click(piece.prepareForMove);
    $field.append($piece);
}




