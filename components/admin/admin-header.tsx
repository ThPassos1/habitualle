export function AdminHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="border-b border-stone-200 px-4 py-8 md:px-10">
      <h1 className="font-serif text-3xl text-stone-800 md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">{description}</p>
    </header>
  );
}
