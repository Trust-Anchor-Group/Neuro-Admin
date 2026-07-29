import MyKYCBuilder from "@/components/settings/kyc/MyKYCBuilder";
import { Suspense } from "react";

export default function CreateMyKYCPage() {
  return (
    <Suspense fallback={null}>
      <MyKYCBuilder />
    </Suspense>
  );
}
