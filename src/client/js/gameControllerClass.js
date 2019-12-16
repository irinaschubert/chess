/**
 *  representing the gameController
 *  @author Irina
 *
 * */

'use strict';

import Board from "./board.js";
import Bishop from './pieces/bishop.js';
import King from './pieces/king.js';
import Knight from './pieces/knight.js';
import Pawn from './pieces/pawn.js';
import Queen from './pieces/queen.js';
import Rook from './pieces/rook.js';

const START = 0;
const LOAD = 1;

let chessGame = {};
let moveObject = [];

export default class GameController {
    constructor(){
        chessGame.savingObject = {};
        chessGame.savingObject.fields = [];
        chessGame.savingObject.capturedPieces = [];

        $(".load-when-clicked").click(this.loadFunctionality(LOAD));
        $(document).ready(this.loadFunctionality(START));
    }

    setupGame(boardElement) {
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
        pieces.forEach(this.placePieceOnBoard)
    }

    placePieceOnBoard(piece) {
        const i = piece.position[0];
        const j = piece.position[1];
        const $field = $(`.field[data-row = ${i}][data-col = ${j}]`);
        const $piece = $('<div>').addClass('piece');
        $piece.addClass(piece.constructor.name.toLowerCase());
        $piece.addClass(piece.color);
        $piece.addClass('not-clickable');
        $field.append($piece);
    }

    checkForPiecesInbetween(fieldsToCheck) {
        // if piece is inbetween, move should not be allowed
        let pieceInbetween = false;
        for (let i in fieldsToCheck) {
            if (fieldsToCheck.hasOwnProperty(i)) {
                let field = fieldsToCheck[i];
                let col = field[0];
                let row = field[1];
                $('.field').each(function () {
                    if ($(this).data('row') === row && $(this).data('col') === col) {
                        if ($(this).find('.piece').length) {
                            pieceInbetween = true;
                        }
                    }
                });
            }
        }
        return pieceInbetween;
    }

    validateMove(moveObject) {
        let gC = this;
        let fromNode = moveObject[0];
        let from = moveObject[1];
        let to = moveObject[2];
        let toNode = moveObject[3];

        let fromColor = '';
        let fromPiece = {};

        let toColor = '';
        let toPiece = {};

        // get the from-color
        if (fromNode.classList.contains('white')) {
            fromColor = "white";
        } else if (fromNode.classList.contains('black')) {
            fromColor = "black";
        }
        // get the from-piece type and make from-piece
        if (fromNode.classList.contains("bishop")) {
            fromPiece = new Bishop(fromColor, from);
        } else if (fromNode.classList.contains("king")) {
            fromPiece = new King(fromColor, from);
        } else if (fromNode.classList.contains("knight")) {
            fromPiece = new Knight(fromColor, from);
        } else if (fromNode.classList.contains("pawn")) {
            fromPiece = new Pawn(fromColor, from);
        } else if (fromNode.classList.contains("queen")) {
            fromPiece = new Queen(fromColor, from);
        } else if (fromNode.classList.contains("rook")) {
            fromPiece = new Rook(fromColor, from);
        }

        // get the to-color
        if(toNode.classList.contains("piece")){
            if (toNode.classList.contains('white')) {
                toColor = "white";
            } else if (toNode.classList.contains('black')) {
                toColor = "black";
            }
        }
        else if(toNode.classList.contains("field")){
            $(toNode).children(".piece").each(function(){
                if ($(this).hasClass('white')) {
                    toColor = "white";
                } else if ($(this).hasClass('black')) {
                    toColor = "black";
                }
                // get the to-piece type and make to-piece
                if ($(this).hasClass("bishop")) {
                    toPiece = new Bishop(toColor, to);
                } else if ($(this).hasClass("king")) {
                    toPiece = new King(toColor, to);
                } else if ($(this).hasClass("knight")) {
                    toPiece = new Knight(toColor, to);
                } else if ($(this).hasClass("pawn")) {
                    toPiece = new Pawn(toColor, to);
                } else if ($(this).hasClass("queen")) {
                    toPiece = new Queen(toColor, to);
                } else if ($(this).hasClass("rook")) {
                    toPiece = new Rook(toColor, to);
                }
            });
        }

        // validate move
        let validMove = fromPiece.validateMove(from, to);
        if (validMove !== false) {
            let piecesInbetween = true;
            // if piece is a knight, move anyway
            if (fromPiece instanceof Knight) {
                gC.move(to, from, toColor, fromColor, toNode, fromNode);
            }
            // if piece is a pawn, treat differently
            else if (fromPiece instanceof Pawn) {
                gC.movePawn(to, from, toColor, fromColor, toNode, fromNode);
            }
            // if validMove is [], no piece is inbetween (also the case if piece moves just one field), move
            else if (validMove === []) {
                gC.move(to, from, toColor, fromColor, toNode, fromNode);
            }
            // for all other cases (piece is not a knight and more than 1 field is moved) check if a piece is inbetween, don't move in that case
            else {
                piecesInbetween = gC.checkForPiecesInbetween(validMove);
                if (!piecesInbetween) {
                    gC.move(to, from, toColor, fromColor, toNode, fromNode);
                }
            }
        }
    }

    move(to, from, toColor, fromColor, toNode, fromNode) {
        // capture piece if color is different
        if (toColor !== '' && toColor !== fromColor) {
            $(toNode).children(".piece").each(function(){
                if ($(this).hasClass(toColor)) {
                    $(this).removeClass("piece not-clickable not-my-color");
                    $(this).addClass("captured");
                    let capturedPieces = document.getElementById("field-captured");
                    capturedPieces.appendChild(this);
                }
            });
            toNode.appendChild(fromNode);
        }
        // move only if field is not occupied by another piece of same color
        else if (toColor === '') {
            toNode.appendChild(fromNode);
        }
        let toStr = to.join();
        let fromStr = from.join();
        $("#show-move").html(fromStr + " --> " + toStr);
    }

    movePawn(to, from, toColor, fromColor, toNode, fromNode) {
        let gc = this;
        let distX = to[0] - from[0];
        let distY = to[1] - from[1];
        if (fromColor === "white") {
            // move diagonally only if there is a piece of the enemy
            if (distX === 1 && distY === 1 || distX === -1 && distY === 1) {
                if (fromColor !== toColor && toColor !== '') {
                    gc.move(to, from, toColor, fromColor, toNode, fromNode);
                }
            }
            // move straigth forward
            else if (distY === 1 && distX === 0 || distY === 2 && distX === 0 && from[1] === 2) {
                // move only if field is not occupied by another piece of same color
                if (toColor === '') {
                    toNode.appendChild(fromNode);
                }
                let toStr = to.join();
                let fromStr = from.join();
                $("#show-move").html(fromStr + " --> " + toStr);
            }
        } else if (fromColor === "black") {
            // move diagonally only if there is a piece of the enemy
            if (distX === 1 && distY === -1 || distX === -1 && distY === -1) {
                if (fromColor !== toColor && toColor !== '') {
                    gc.move(to, from, toColor, fromColor, toNode, fromNode);
                }
            }
            // move straigth forward
            else if (distY === -1 && distX === 0 || distY === -2 && distX === 0 && from[1] === 7) {
                // move only if field is not occupied by another piece
                if (toColor === '') {
                    toNode.appendChild(fromNode);
                }
                let toStr = to.join();
                let fromStr = from.join();
                $("#show-move").html(fromStr + " --> " + toStr);
            }
        }
    }

    loadFunctionality(startOrLoad){
        let gc = this;

        const $board = $('#board');
        if(startOrLoad === START){
            gc.setupGame($board);
        }

        $board.children().each(function() {
            $(this).click(function(e){
                if (e.target.classList.contains("piece") || e.target.classList.contains("field")) {
                    let clickedFieldsLength = $(".clicked").length;
                    // from (first click)
                    if (clickedFieldsLength === 0) {
                        moveObject = [];
                        if (e.target.classList.contains("piece")) {
                            $(e.target.parentNode.classList.toggle('clicked'));
                            moveObject.push(e.target);
                            moveObject.push([$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
                        }
                    }

                    // to (second click)
                    else if (clickedFieldsLength === 1) {
                        $(e.target.classList.toggle('clicked'));

                        if (e.target.classList.contains("piece")) {
                            moveObject.push([$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
                            moveObject.push(e.target);
                            //console.log("to: " + [$(e.target.parentNode).data('col'), $(e.target.parentNode).data('row')]);
                        } else if (e.target.classList.contains("field")) {
                            moveObject.push([$(e.target).data('col'), $(e.target).data('row')]);
                            moveObject.push(e.target);
                            //console.log("to: " + [$(e.target).data('col'), $(e.target).data('row')]);
                        }
                        let elements = document.querySelectorAll('.clicked');
                        [].forEach.call(elements, function (el) {
                            el.classList.remove('clicked');
                        });
                        gc.validateMove(moveObject);
                    }
                }
            });
        });

        //TODO: implement back button functionality
        $('#back').click(() => {
            let lastMove = [];
            let lastMoveObj = JSON.parse(lastMove);
            if(lastMoveObj !== null){
                //console.log(lastMoveObj)
            }
        });

    }
}

