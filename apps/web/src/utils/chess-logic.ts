import type { ChessPiece, PieceColor, Position, GameState, Move } from '../types/chess';
import { isValidPosition, positionsEqual, copyBoard, findKing } from './chess-utils';

export function getValidMoves(gameState: GameState, position: Position): Position[] {
  const piece = gameState.board[position.row][position.col];
  if (!piece || piece.color !== gameState.currentPlayer) return [];

  const moves: Position[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(gameState, position));
      break;
    case 'rook':
      moves.push(...getRookMoves(gameState, position));
      break;
    case 'knight':
      moves.push(...getKnightMoves(gameState, position));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(gameState, position));
      break;
    case 'queen':
      moves.push(...getQueenMoves(gameState, position));
      break;
    case 'king':
      moves.push(...getKingMoves(gameState, position));
      break;
  }

  return moves.filter(move => !wouldBeInCheck(gameState, position, move));
}

function getPawnMoves(gameState: GameState, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = gameState.board[position.row][position.col]!;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward move
  const oneForward = { row: position.row + direction, col: position.col };
  if (isValidPosition(oneForward) && !gameState.board[oneForward.row][oneForward.col]) {
    moves.push(oneForward);

    // Two squares forward from starting position
    if (position.row === startRow) {
      const twoForward = { row: position.row + 2 * direction, col: position.col };
      if (isValidPosition(twoForward) && !gameState.board[twoForward.row][twoForward.col]) {
        moves.push(twoForward);
      }
    }
  }

  // Diagonal captures
  for (const colOffset of [-1, 1]) {
    const capturePos = { row: position.row + direction, col: position.col + colOffset };
    if (isValidPosition(capturePos)) {
      const targetPiece = gameState.board[capturePos.row][capturePos.col];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(capturePos);
      }
      // En passant
      if (gameState.enPassantTarget && positionsEqual(capturePos, gameState.enPassantTarget)) {
        moves.push(capturePos);
      }
    }
  }

  return moves;
}

function getRookMoves(gameState: GameState, position: Position): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos = { row: position.row + i * dRow, col: position.col + i * dCol };
      if (!isValidPosition(newPos)) break;

      const targetPiece = gameState.board[newPos.row][newPos.col];
      if (!targetPiece) {
        moves.push(newPos);
      } else {
        if (targetPiece.color !== gameState.board[position.row][position.col]!.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }

  return moves;
}

function getKnightMoves(gameState: GameState, position: Position): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [dRow, dCol] of knightMoves) {
    const newPos = { row: position.row + dRow, col: position.col + dCol };
    if (isValidPosition(newPos)) {
      const targetPiece = gameState.board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== gameState.board[position.row][position.col]!.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

function getBishopMoves(gameState: GameState, position: Position): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos = { row: position.row + i * dRow, col: position.col + i * dCol };
      if (!isValidPosition(newPos)) break;

      const targetPiece = gameState.board[newPos.row][newPos.col];
      if (!targetPiece) {
        moves.push(newPos);
      } else {
        if (targetPiece.color !== gameState.board[position.row][position.col]!.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }

  return moves;
}

function getQueenMoves(gameState: GameState, position: Position): Position[] {
  return [...getRookMoves(gameState, position), ...getBishopMoves(gameState, position)];
}

function getKingMoves(gameState: GameState, position: Position): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dRow, dCol] of directions) {
    const newPos = { row: position.row + dRow, col: position.col + dCol };
    if (isValidPosition(newPos)) {
      const targetPiece = gameState.board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== gameState.board[position.row][position.col]!.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

function wouldBeInCheck(gameState: GameState, from: Position, to: Position): boolean {
  const newBoard = copyBoard(gameState.board);
  const piece = newBoard[from.row][from.col]!;
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  const kingPos = piece.type === 'king' ? to : findKing(newBoard, piece.color);
  return isPositionAttacked(newBoard, kingPos, piece.color === 'white' ? 'black' : 'white');
}

function isPositionAttacked(board: (ChessPiece | null)[][], position: Position, byColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        if (canAttackPosition(board, { row, col }, position)) {
          return true;
        }
      }
    }
  }
  return false;
}

function canAttackPosition(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from.row][from.col]!;
  
  switch (piece.type) {
    case 'pawn':
      return canPawnAttack(from, to, piece.color);
    case 'rook':
      return canRookAttack(board, from, to);
    case 'knight':
      return canKnightAttack(from, to);
    case 'bishop':
      return canBishopAttack(board, from, to);
    case 'queen':
      return canRookAttack(board, from, to) || canBishopAttack(board, from, to);
    case 'king':
      return canKingAttack(from, to);
    default:
      return false;
  }
}

function canPawnAttack(from: Position, to: Position, color: PieceColor): boolean {
  const direction = color === 'white' ? -1 : 1;
  return to.row === from.row + direction && Math.abs(to.col - from.col) === 1;
}

function canRookAttack(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  if (from.row !== to.row && from.col !== to.col) return false;
  
  const dRow = from.row === to.row ? 0 : (to.row - from.row) / Math.abs(to.row - from.row);
  const dCol = from.col === to.col ? 0 : (to.col - from.col) / Math.abs(to.col - from.col);
  
  let row = from.row + dRow;
  let col = from.col + dCol;
  
  while (row !== to.row || col !== to.col) {
    if (board[row][col]) return false;
    row += dRow;
    col += dCol;
  }
  
  return true;
}

function canKnightAttack(from: Position, to: Position): boolean {
  const dRow = Math.abs(to.row - from.row);
  const dCol = Math.abs(to.col - from.col);
  return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
}

function canBishopAttack(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) return false;
  
  const dRow = (to.row - from.row) / Math.abs(to.row - from.row);
  const dCol = (to.col - from.col) / Math.abs(to.col - from.col);
  
  let row = from.row + dRow;
  let col = from.col + dCol;
  
  while (row !== to.row || col !== to.col) {
    if (board[row][col]) return false;
    row += dRow;
    col += dCol;
  }
  
  return true;
}

function canKingAttack(from: Position, to: Position): boolean {
  return Math.abs(to.row - from.row) <= 1 && Math.abs(to.col - from.col) <= 1;
}

export function isInCheck(gameState: GameState, color: PieceColor): boolean {
  const kingPos = findKing(gameState.board, color);
  return isPositionAttacked(gameState.board, kingPos, color === 'white' ? 'black' : 'white');
}