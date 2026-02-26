import { Monitor } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Driver View | Wavespace",
};

export default function DriverLandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Monitor className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Driver View</h1>
        <p className="text-muted-foreground">
          Open a quiz from the admin to display the driver (projector) view. The
          driver URL is unique per quiz.
        </p>
        <Link
          href="/admin-wavespace"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to Admin
        </Link>
      </div>
    </main>
  );
}
