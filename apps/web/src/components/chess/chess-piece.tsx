import { component$ } from '@builder.io/qwik';
import type { ChessPiece } from '../../types/chess';
import { getPieceSymbol } from '../../utils/chess-utils';

interface ChessPieceProps {
  piece: ChessPiece;
  isSelected?: boolean;
}

export const ChessPieceComponent = component$<ChessPieceProps>(({ piece, isSelected }) => {
  return (
    <div
      class={`chess-piece ${piece.color} ${isSelected ? 'selected' : ''}`}
      style={{
        fontSize: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {getPieceSymbol(piece)}
    </div>
  );
});