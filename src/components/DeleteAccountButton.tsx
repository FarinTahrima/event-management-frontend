import { useAppContext } from "@/contexts/AppContext";
import * as apiClient from "@/utils/api-client";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "./ui/use-toast";

const DeleteAccountButton = () => {
  const { setIsLoggedIn, user, setUser } = useAppContext();
  const navigate = useNavigate();
  const deleteButtonPress = () => {
    if (user !== null) {
      apiClient.deleteUser(user?.id);
      setIsLoggedIn(false);
      setUser(null);
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted.",
        duration: 5000,
        variant: "destructive",
      });
      navigate("/");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 
        inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
        ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        px-4 py-3"
      >
        Delete Account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-normal text-slate-800">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteButtonPress();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 
        inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
        ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        px-4 py-3"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountButton;
