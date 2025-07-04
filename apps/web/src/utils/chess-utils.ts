import type { ChessPiece, PieceColor, Position } from '../types/chess';

export const INITIAL_BOARD: (ChessPiece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

export const PIECE_SYMBOLS: Record<string, string> = {
  'king-white': '♔',
  'queen-white': '♕',
  'rook-white': '♖',
  'bishop-white': '♗',
  'knight-white': '♘',
  'pawn-white': '♙',
  'king-black': '♚',
  'queen-black': '♛',
  'rook-black': '♜',
  'bishop-black': '♝',
  'knight-black': '♞',
  'pawn-black': '♟',
};

export function getPieceSymbol(piece: ChessPiece): string {
  return PIECE_SYMBOLS[`${piece.type}-${piece.color}`] || '';
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function copyBoard(board: (ChessPiece | null)[][]): (ChessPiece | null)[][] {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

export function findKing(board: (ChessPiece | null)[][], color: PieceColor): Position {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  throw new Error(`King not found for color: ${color}`);
}