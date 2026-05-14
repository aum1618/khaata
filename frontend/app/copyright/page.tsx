import Link from "next/link";
import { NeoCard } from "@/components/neo-ui";

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-[#FFFEF0] text-black px-6 py-12 md:px-12 neo-page">
      <div className="max-w-3xl mx-auto space-y-6">
        <NeoCard className="p-6 md:p-8" shadow="lg">
          <h1 className="text-3xl font-bold mb-3">Copyright</h1>
          <p className="text-gray-700">
            This is a placeholder copyright page for Khaata. All product names,
            logos, and brands are property of their respective owners.
          </p>
          <p className="text-gray-700 mt-4">
            Want something more official here? Tell us what you want to include.
          </p>
          <div className="mt-6">
            <Link href="/" className="font-medium hover:underline">
              Back to home
            </Link>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
