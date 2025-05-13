import ForgotPasswordForSignUpForm from "@/components/auth/ForgotPasswordForSignUpForm";

export default function ForgotPasswordForSignUp() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForSignUpForm />
      </div>
    </div>
  );
}
