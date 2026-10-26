export const dynamic = "force-dynamic";

export default function SharedPage() {
  return (
    <div className="mx-auto max-w-xl p-8 text-center">
      <div className="mt-16 text-4xl">👥</div>
      <h1 className="mt-4 text-xl font-semibold">Nothing shared with you yet</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Routine templates, personal instances, and links people share with you will appear here.
      </p>
    </div>
  );
}
