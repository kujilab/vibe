import { component$, useStore, useTask$, $ } from '@builder.io/qwik';
import type { GameState, Position, Move } from '../../types/chess';
import { INITIAL_BOARD, findKing, copyBoard, positionsEqual } from '../../utils/chess-utils';
import { getValidMoves, isInCheck } from '../../utils/chess-logic';
import { ChessSquare } from './chess-square';

export const ChessBoard = component$(() => {
  const gameState = useStore<GameState>({
    board: INITIAL_BOARD,
    currentPlayer: 'white',
    status: 'playing',
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    kings: {
      white: { row: 7, col: 4 },
      black: { row: 0, col: 4 },
    },
    enPassantTarget: null,
  });

  useTask$(() => {
    // Update kings positions
    gameState.kings.white = findKing(gameState.board, 'white');
    gameState.kings.black = findKing(gameState.board, 'black');
    
    // Check for check
    if (isInCheck(gameState, gameState.currentPlayer)) {
      gameState.status = 'check';
    } else {
      gameState.status = 'playing';
    }
  });

  const makeMove = $((from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col]!;
    const capturedPiece = gameState.board[to.row][to.col];
    
    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
    };

    // Move the piece
    gameState.board[to.row][to.col] = { ...piece, hasMoved: true };
    gameState.board[from.row][from.col] = null;

    // Handle en passant target
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      gameState.enPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    } else {
      gameState.enPassantTarget = null;
    }

    gameState.moveHistory.push(move);
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
  });

  const handleSquareClick = $((position: Position) => {
    const piece = gameState.board[position.row][position.col];
    
    if (gameState.selectedSquare) {
      // If clicking on a valid move
      if (gameState.validMoves.some(move => positionsEqual(move, position))) {
        makeMove(gameState.selectedSquare, position);
        gameState.selectedSquare = null;
        gameState.validMoves = [];
      } 
      // If clicking on own piece
      else if (piece && piece.color === gameState.currentPlayer) {
        gameState.selectedSquare = position;
        gameState.validMoves = getValidMoves(gameState, position);
      }
      // If clicking elsewhere, deselect
      else {
        gameState.selectedSquare = null;
        gameState.validMoves = [];
      }
    } else {
      // If clicking on own piece
      if (piece && piece.color === gameState.currentPlayer) {
        gameState.selectedSquare = position;
        gameState.validMoves = getValidMoves(gameState, position);
      }
    }
  });

  const resetGame = $(() => {
    gameState.board = copyBoard(INITIAL_BOARD);
    gameState.currentPlayer = 'white';
    gameState.status = 'playing';
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    gameState.moveHistory = [];
    gameState.kings = {
      white: { row: 7, col: 4 },
      black: { row: 0, col: 4 },
    };
    gameState.enPassantTarget = null;
  });

  return (
    <div class="chess-game">
      <div class="game-info">
        <h2>Chess Game</h2>
        <p>Current Player: {gameState.currentPlayer}</p>
        <p>Status: {gameState.status}</p>
        <button onClick$={resetGame} style={{ marginTop: '10px', padding: '10px 20px' }}>
          New Game
        </button>
      </div>
      
      <div
        class="chess-board"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 60px)',
          gridTemplateRows: 'repeat(8, 60px)',
          gap: '0',
          border: '2px solid #333',
          margin: '20px 0',
        }}
      >
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = gameState.selectedSquare && 
              positionsEqual(gameState.selectedSquare, position);
            const isValidMove = gameState.validMoves.some(move => 
              positionsEqual(move, position));

            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                position={position}
                isLight={isLight}
                isSelected={!!isSelected}
                isValidMove={isValidMove}
                onSquareClick={handleSquareClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
});