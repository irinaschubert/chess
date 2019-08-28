/*
 Author: Irina Schubert
 Url: https://git.ffhs.ch/irina.schubert/chess.git
 */

'use strict';

import Board from "./board.js";

const $board = $('#board');

let board = new Board();

function start(){
    board.createBoard($board);
}



window.addEventListener("load", start, false);