import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChangePassword() {
  return (
    <div className="mb-8 mt-10 flex min-h-80 w-full justify-center px-4 align-middle lg:mt-24 lg:px-0">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Change Your Password</CardTitle>
          <CardDescription>
            Your old password need to fill and update your new password here .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
