import { OTPForm } from "@/components/auth/OtpForm";

const OTP = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OTPForm />
      </div>
    </div>
  );
};

export default OTP;
