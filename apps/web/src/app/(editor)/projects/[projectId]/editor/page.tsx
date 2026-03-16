import { EditorPage } from "@/components/editor/editor-page";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectEditorPage({ params }: Props) {
  const { projectId } = await params;
  return <EditorPage projectId={projectId} />;
}
