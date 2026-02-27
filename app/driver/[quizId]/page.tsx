import { DriverClient } from "@/components/driver/driver-client";

export const metadata = {
  title: "Driver View | Wavespace",
};

export default async function DriverPage({
  params,
}: {
  params: { quizId: string };
}) {
  const { quizId } = params;
  return <DriverClient quizId={quizId} />;
}
