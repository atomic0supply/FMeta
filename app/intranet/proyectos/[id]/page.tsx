import { ProjectDetailView } from "@/components/ProjectDetailView";

export const metadata = {
  title: "Proyecto — Roqueta",
};

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailView id={id} />;
}
