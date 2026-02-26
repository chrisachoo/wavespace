import { DriverClient } from "@/components/driver/driver-client";

export const metadata = {
  title: "Driver View | Wavespace",
};

export default async function DriverPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  return <DriverClient quizId={quizId} />;
}
