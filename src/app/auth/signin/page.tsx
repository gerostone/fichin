import { SignInForm } from "@/components/forms/signin-form";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";

  return <SignInForm callbackUrl={callbackUrl} />;
}
