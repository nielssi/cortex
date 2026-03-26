import { NoteEditor } from "./NoteEditor";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="flex-1 flex flex-col">
      <NoteEditor id={id} />
    </main>
  );
}
