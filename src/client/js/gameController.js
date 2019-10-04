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
let moveObject = [];

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
    const i = piece.position[0];
    const j = piece.position[1];
    const $field = $(`.field[data-row = ${i}][data-col = ${j}]`);
    const $piece = $('<div>').addClass('piece');
    $piece.addClass(piece.constructor.name.toLowerCase());
    $piece.addClass(piece.color);
    $piece.click(piece.prepareForMove);
    $field.append($piece);
}

function checkForPiecesInbetween(piece, from, to){
    // if piece inbetween --> move not allowed


    // else --> move allowed
}

function move(moveObject){
    let fromNode = moveObject[0];
    let from = moveObject[1];
    let to = moveObject[2];
    let toNode = moveObject[3];

    console.log(fromNode);
    console.log(toNode);

    let fromColor = '';
    let fromPiece = {};

    let toColor = '';
    let toPiece = {};

    // get the from-color
    if(fromNode.classList.contains('white')){
        fromColor = "white";
    }
    else if(fromNode.classList.contains('black')){
        fromColor = "black";
    }
    // get the from-piece type and make from-piece
    if(fromNode.classList.contains("bishop")){
        fromPiece = new Bishop(fromColor, from);
    }
    else if(fromNode.classList.contains("king")){
        fromPiece = new King(fromColor, from);
    }
    else if(fromNode.classList.contains("knight")){
        fromPiece = new Knight(fromColor, from);
    }
    else if(fromNode.classList.contains("pawn")){
        fromPiece = new Pawn(fromColor, from);
    }
    else if(fromNode.classList.contains("queen")){
        fromPiece = new Queen(fromColor, from);
    }
    else if(fromNode.classList.contains("rook")){
        fromPiece = new Rook(fromColor, from);
    }

    // get the to-color
    if(toNode.classList.contains('piece')){
        if(toNode.classList.contains('white')){
            toColor = "white";
        }
        else if(toNode.classList.contains('black')){
            toColor = "black";
        }
        // get the to-piece type and make to-piece
        if(toNode.classList.contains("bishop")){
            toPiece = new Bishop(toColor, to);
        }
        else if(toNode.classList.contains("king")){
            toPiece = new King(toColor, to);
        }
        else if(toNode.classList.contains("knight")){
            toPiece = new Knight(toColor, to);
        }
        else if(toNode.classList.contains("pawn")){
            toPiece = new Pawn(toColor, to);
        }
        else if(toNode.classList.contains("queen")){
            toPiece = new Queen(toColor, to);
        }
        else if(toNode.classList.contains("rook")){
            toPiece = new Rook(toColor, to);
        }
    }

    // validate move
    let validMove = fromPiece.validateMove(from, to);
    let piecesInbetween = true;
    if(!(fromPiece instanceof Knight)){
        piecesInbetween = checkForPiecesInbetween(toPiece, from, to);
        if(!piecesInbetween){
            console.log("no pieces inbetween, move is valid")
        }

    }

    if(validMove && !piecesInbetween){
        console.log("move");
        // capture piece
        if(toColor !== ''){
            let parent = toNode.parentNode;
            parent.appendChild(fromNode);
            if(toColor !== fromColor){
                toNode.remove();
            }
        }
        else{
            toNode.appendChild(fromNode);
            // TODO send move to server
        }
    }
    else{
        console.log("move not allowed");
    }
}

// click on a piece and move
$(document).click(function(e) {
    if(e.target.classList.contains("piece") || e.target.classList.contains("field")){
        // from
        if(document.querySelectorAll('.clicked').length === 0){
            moveObject = [];
            if(e.target.classList.contains("piece")){
                $(e.target.parentNode.classList.toggle('clicked')) ;
                moveObject.push(e.target);
                moveObject.push([$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
                console.log("from: " + [$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
            }
        }

        // to
        else if(document.querySelectorAll('.clicked').length === 1){
            $(e.target.classList.toggle('clicked')) ;

            if(e.target.classList.contains("piece")){
                moveObject.push([$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
                moveObject.push(e.target);
                console.log("to: " + [$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
            }
            else if(e.target.classList.contains("field")){
                moveObject.push([$(e.target).data('col'), $(e.target).data('row')]);
                moveObject.push(e.target);
                console.log("to: " + [$(e.target).data('col'), $(e.target).data('row')]);
            }
            let elements = document.querySelectorAll('.clicked');
            [].forEach.call(elements, function(el) {
                el.classList.remove('clicked');
            });

            move(moveObject);


        }
    }
});

