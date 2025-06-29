interface Props {
  params: { id: string };
}

export default function CoursePage({ params }: Props) {
  const { id } = params;
  const courseId = id; // For backwards compatibility
  // ... rest of component code
}
