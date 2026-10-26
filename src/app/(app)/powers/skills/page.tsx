export default function SkillsPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Skills</h1>
      <p className="mt-1 text-sm text-neutral-500">Teach your assistant how you work with reusable instructions, examples, and reference files.</p>
      <div className="mt-6 rounded-xl border-2 border-dashed bg-white p-10 text-center text-sm text-neutral-500">
        Upload a <code>SKILL.md</code> or a .zip archive — your assistant will learn the workflow and apply it on request.
      </div>
    </div>
  );
}
