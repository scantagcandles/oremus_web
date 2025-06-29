interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResourcePage({ params }: Props) {
  const { id } = await params;
  const courseId = id; // For backwards compatibility
  // ... rest of component code
}
