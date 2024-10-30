import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import profileIcon from "/profileicon.svg";
import profileIconBg from "/profileiconbg.svg";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button.tsx";
import LogoutButton from "./LogoutButton";
const NavbarProfile = () => {
  const [isMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const iconRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const { user } = useAppContext();

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prevState) => !prevState);
  };

  const handleProfileClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(event.target as Node)
    ) {
      setIsProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleProfileClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleProfileClickOutside);
    };
  }, []);

  return (
    <div className="relative flex items-center pl-2 pr-2 sm:pl-6 sm:pr-6">
      <div
        ref={iconRef}
        className="relative cursor-pointer w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] 2xl:w-[65px] 2xl:h-[65px] 3xl:w-[70px] 3xl:h-[70px] 4xl:w-[75px] 4xl:h-[75px] 5xl:w-[80px] 5xl:h-[80px]"
        onClick={toggleProfileMenu}
      >
        <img
          src={profileIcon}
          alt="Profile Icon"
          className="absolute top-0 left-0 w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] 2xl:w-[65px] 2xl:h-[65px] 3xl:w-[70px] 3xl:h-[70px] 4xl:w-[75px] 4xl:h-[75px] 5xl:w-[80px] 5xl:h-[80px]"
        />
        <img
          src={profileIconBg}
          alt="Profile Icon Background"
          className="absolute top-0 left-0 w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] 2xl:w-[65px] 2xl:h-[65px] 3xl:w-[70px] 3xl:h-[70px] 4xl:w-[75px] 4xl:h-[75px] 5xl:w-[80px] 5xl:h-[80px]"
        />
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute mt-2 w-48 bg-black text-white shadow-lg rounded-md z-50"
          style={{
            top: "100%",
            right: 0,
            transform: "translateX(0%)",
            backgroundColor: "rgb(2, 8, 23)",
          }}
        >
          <p className="text-white font-alatsi px-4 py-2 border-b border-gray-600 text-2xl">
            Hello <span className="font-bold">{user?.username}</span>
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              asChild
              className="w-full text-left text-2xl text-white"
            >
              <Link
                to={`/update-profile`}
                onClick={() => setIsProfileMenuOpen(false)}
              >
                Account
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="w-full text-left text-2xl text-white"
            >
              <Link to={`/contact`} onClick={() => setIsProfileMenuOpen(false)}>
                Contact
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarProfile;
