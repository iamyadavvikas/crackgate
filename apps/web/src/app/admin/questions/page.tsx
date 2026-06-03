import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import AdminQuestionsClient from "./AdminQuestionsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Question Bank — Admin · CrackGate" };

export default async function AdminQuestionsPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin/questions");

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">Question Bank</h1>
        <p className="text-muted text-sm mt-1">
          Add new questions to the 906-Q practice bank. Each upload optionally rebuilds the 10 mocks (65 Q · 100 marks · 3 h).
        </p>
      </header>
      <AdminQuestionsClient />
    </div>
  );
}
