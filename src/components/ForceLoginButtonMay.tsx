import { useAppContext } from "@/contexts/AppContext";
import { Button } from "./ui/button";
import { User } from "@/utils/types";
import { useNavigate } from "react-router-dom";

const ForceLoginButtonMay = () => {
  const { setIsLoggedIn, setUser } = useAppContext();
  const navigate = useNavigate();

  const fakeUsers: User[] = [
    {
      id: 9999,
      username: "maylwin.dev",
      email: "watergirl@example.com",
    },
    {
      id: 9998,
      username: "handythong.dev",
      email: "phantasm.wing@example.com",
    },
    {
      id: 9997,
      username: "max.dev",
      email: "arckey@example.com",
    },
    {
      id: 9996,
      username: "timothy.dev",
      email: "geishaboi@example.com",
    },
  ];

  function pickRandomUser(): User {
    return fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  }

  const handleForceLogin = () => {
    // Set user in context
    setUser(pickRandomUser());
    // Set isLoggedIn flag in context to true
    setIsLoggedIn(true);
    navigate("/");
  };

  return (
    <>
      <Button variant="destructive" onClick={handleForceLogin}>
        FORCE LOGIN (for dev)
      </Button>
    </>
  );
};

export default ForceLoginButtonMay;
