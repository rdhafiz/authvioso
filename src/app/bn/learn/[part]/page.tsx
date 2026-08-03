import type { Metadata } from "next";

import { buildPartMetadata, PartPage } from "@/components/pages/part-page";
import { getAllParts } from "@/lib/content/queries";

interface Props {
  params: Promise<{ part: string }>;
}

export function generateStaticParams() {
  return getAllParts().map((part) => ({ part: part.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part } = await params;
  return buildPartMetadata(part, "bn");
}

export default async function Page({ params }: Props) {
  const { part } = await params;
  return <PartPage slug={part} locale="bn" />;
}
