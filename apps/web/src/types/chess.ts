export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotion?: PieceType;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  status: GameStatus;
  selectedSquare: Position | null;
  validMoves: Position[];
  moveHistory: Move[];
  kings: {
    white: Position;
    black: Position;
  };
  enPassantTarget: Position | null;
}