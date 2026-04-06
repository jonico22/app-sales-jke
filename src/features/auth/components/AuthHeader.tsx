export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold font-headings text-foreground mb-3">{title}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed px-4">
        {description}
      </p>
    </div>
  );
}
