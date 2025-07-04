import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CalendarView } from "../../components/calendar/calendar-view";

export default component$(() => {
  return (
    <>
      <CalendarView />
    </>
  );
});

export const head: DocumentHead = {
  title: "日毎データ確認 - Vibe",
  meta: [
    {
      name: "description",
      content: "カレンダーでOura Ringの日毎データを確認",
    },
  ],
};