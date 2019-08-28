/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Board from "./board.js";
import Figure from "./figure.js";

const $board = $('#board');
let board = new Board();

function start(){
    board.createBoard($board);
    let w_pawn = new Figure("pawn", "white", 1, 1);
    board.placeFigureOnBoard(w_pawn);
}

window.addEventListener("load", start, false);