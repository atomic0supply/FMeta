import { ClientDetailView } from "@/components/ClientDetailView";

export const metadata = {
  title: "Cliente — Roqueta",
};

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailView id={id} />;
}
