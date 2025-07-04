import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ChessBoard } from "../../components/chess/chess-board";

export default component$(() => {
  return (
    <>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <ChessBoard />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Chess Game - Vibe",
  meta: [
    {
      name: "description",
      content: "Play chess in your browser with an interactive chess board",
    },
  ],
};