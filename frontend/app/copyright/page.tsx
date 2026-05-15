import Link from "next/link";
import { NeoCard } from "@/components/neo-ui";
import { strings } from "@/locales/en";

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-background text-black px-6 py-12 md:px-12 neo-page">
      <div className="max-w-3xl mx-auto space-y-6">
        <NeoCard className="p-6 md:p-8" shadow="lg">
          <h1 className="text-3xl font-bold mb-3">{strings.copyright.title}</h1>
          <p className="text-gray-700">{strings.copyright.bodyOne}</p>
          <p className="text-gray-700 mt-4">{strings.copyright.bodyTwo}</p>
          <div className="mt-6">
            <Link href="/" className="font-medium hover:underline">
              {strings.copyright.back}
            </Link>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
