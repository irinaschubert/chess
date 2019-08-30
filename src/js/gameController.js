/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Piece from "./piece.js";
import Board from "./board.js";

const $board = $('#board');
window.addEventListener("load", setupGame($board), false);

function setupGame(boardElement){
    let board = new Board(boardElement);
    board.createBoard();
    let w_pawn_1 = new Piece("w_pawn_1", "pawn", "white", 2, 1);
    let w_pawn_2 = new Piece("w_pawn_2", "pawn", "white", 2, 2);
    let w_pawn_3 = new Piece("w_pawn_3", "pawn", "white", 2, 3);
    let w_pawn_4 = new Piece("w_pawn_4", "pawn", "white", 2, 4);
    let w_pawn_5 = new Piece("w_pawn_5", "pawn", "white", 2, 5);
    let w_pawn_6 = new Piece("w_pawn_6", "pawn", "white", 2, 6);
    let w_pawn_7 = new Piece("w_pawn_7", "pawn", "white", 2, 7);
    let w_pawn_8 = new Piece("w_pawn_8", "pawn", "white", 2, 8);
    let w_bishop_1 = new Piece("w_bishop_1", "bishop", "white", 1, 3);
    let w_bishop_2 = new Piece("w_bishop_2", "bishop", "white", 1, 6);
    let w_knight_1 = new Piece("w_knight_1", "knight", "white", 1, 2);
    let w_knight_2 = new Piece("w_knight_2", "knight", "white", 1, 7);
    let w_rook_1 = new Piece("w_rook_1", "rook", "white", 1, 1);
    let w_rook_2 = new Piece("w_rook_2", "rook", "white", 1, 8);
    let w_king = new Piece("w_king", "king", "white", 1, 4);
    let w_queen = new Piece("w_queen", "queen", "white", 1, 5);
    let b_pawn_1 = new Piece("b_pawn_1", "pawn", "black", 7, 1);
    let b_pawn_2 = new Piece("b_pawn_2", "pawn", "black", 7, 2);
    let b_pawn_3 = new Piece("b_pawn_3", "pawn", "black", 7, 3);
    let b_pawn_4 = new Piece("b_pawn_4", "pawn", "black", 7, 4);
    let b_pawn_5 = new Piece("b_pawn_5", "pawn", "black", 7, 5);
    let b_pawn_6 = new Piece("b_pawn_6", "pawn", "black", 7, 6);
    let b_pawn_7 = new Piece("b_pawn_7", "pawn", "black", 7, 7);
    let b_pawn_8 = new Piece("b_pawn_8", "pawn", "black", 7, 8);
    let b_bishop_1 = new Piece("b_bishop_1", "bishop", "black", 8, 3);
    let b_bishop_2 = new Piece("b_bishop_2", "bishop", "black", 8, 6);
    let b_knight_1 = new Piece("b_knight_1", "knight", "black", 8, 2);
    let b_knight_2 = new Piece("b_knight_2", "knight", "black", 8, 7);
    let b_rook_1 = new Piece("b_rook_1", "rook", "black", 8, 1);
    let b_rook_2 = new Piece("b_rook_2", "rook", "black", 8, 8);
    let b_king = new Piece("b_king", "king", "black", 8, 5);
    let b_queen = new Piece("b_queen", "queen", "black", 8, 4);
    placePieceOnBoard(w_pawn_1);
    placePieceOnBoard(w_pawn_2);
    placePieceOnBoard(w_pawn_3);
    placePieceOnBoard(w_pawn_4);
    placePieceOnBoard(w_pawn_5);
    placePieceOnBoard(w_pawn_6);
    placePieceOnBoard(w_pawn_7);
    placePieceOnBoard(w_pawn_8);
    placePieceOnBoard(w_bishop_1);
    placePieceOnBoard(w_bishop_2);
    placePieceOnBoard(w_knight_1);
    placePieceOnBoard(w_knight_2);
    placePieceOnBoard(w_rook_1);
    placePieceOnBoard(w_rook_2);
    placePieceOnBoard(w_king);
    placePieceOnBoard(w_queen);
    placePieceOnBoard(b_pawn_1);
    placePieceOnBoard(b_pawn_2);
    placePieceOnBoard(b_pawn_3);
    placePieceOnBoard(b_pawn_4);
    placePieceOnBoard(b_pawn_5);
    placePieceOnBoard(b_pawn_6);
    placePieceOnBoard(b_pawn_7);
    placePieceOnBoard(b_pawn_8);
    placePieceOnBoard(b_bishop_1);
    placePieceOnBoard(b_bishop_2);
    placePieceOnBoard(b_knight_1);
    placePieceOnBoard(b_knight_2);
    placePieceOnBoard(b_rook_1);
    placePieceOnBoard(b_rook_2);
    placePieceOnBoard(b_king);
    placePieceOnBoard(b_queen);
}

function placePieceOnBoard(piece){
    const i = piece.getStartPositionI();
    const j = piece.getStartPositionJ();
    const $field = $(`.field[data-row = ${i}][data-col = ${j}]`);
    const $piece = $('<div>').addClass('piece');
    $piece.addClass(piece.getType());
    $piece.addClass(piece.getColor());
    $piece.attr("id", piece.getName());
    $field.append($piece);
}




