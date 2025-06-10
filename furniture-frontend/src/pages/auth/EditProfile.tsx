import ChangeProfileForm from "@/components/auth/ChangeProfileForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function EditProfile() {
  return (
    <div className="mb-8 mt-10 flex min-h-80 w-full justify-center px-4 align-middle lg:mt-24 lg:px-0">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Updae Your Profile</CardTitle>
          <CardDescription>
            You can change your first name,last name and profile image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangeProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default EditProfile;
