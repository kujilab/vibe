import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { OuraDashboard } from "../../components/dashboard/oura-dashboard";

export default component$(() => {
  return (
    <>
      <OuraDashboard />
    </>
  );
});

export const head: DocumentHead = {
  title: "Oura Ring Dashboard - Vibe",
  meta: [
    {
      name: "description",
      content: "Track your health metrics with Oura Ring data visualization",
    },
  ],
};