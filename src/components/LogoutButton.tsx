import { useAppContext } from "@/contexts/AppContext";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { setIsLoggedIn, setUser } = useAppContext();
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      // Set user state to null
      setUser(null);
      // Set isLoggedIn state to false
      setIsLoggedIn(false);
      // Display a toast notification with the title "Logged out"
      toast({
        title: "Logged out",
      });
      navigate("/start");
    } catch (error) {
      // Log the error that occurred during the logout process
      console.error(`Error during logout: ${error}`);
      // Additional error handling logic can be added here
    }
  };

  return (
    <Button
      variant="destructive"
      className="text-2xl mx-4"
      onClick={handleLogout}
      aria-label="Logout"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
