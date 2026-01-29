export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectName: string }>;
}) {
  await params;
  return <>{children}</>;
}
