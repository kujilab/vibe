import { component$ } from '@builder.io/qwik';
import type { ChessPiece, Position } from '../../types/chess';
import { ChessPieceComponent } from './chess-piece';

interface ChessSquareProps {
  piece: ChessPiece | null;
  position: Position;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  onSquareClick: (position: Position) => void;
}

export const ChessSquare = component$<ChessSquareProps>(({
  piece,
  position,
  isLight,
  isSelected,
  isValidMove,
  onSquareClick,
}) => {
  return (
    <div
      class={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`}
      style={{
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isLight ? '#f0d9b5' : '#b58863',
        border: isSelected ? '3px solid #f7dc6f' : isValidMove ? '3px solid #82e0aa' : '1px solid #333',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick$={() => onSquareClick(position)}
    >
      {piece && <ChessPieceComponent piece={piece} isSelected={isSelected} />}
      {isValidMove && !piece && (
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#82e0aa',
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
});