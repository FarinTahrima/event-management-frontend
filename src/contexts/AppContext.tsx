import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { Toaster } from "@/components//ui/toaster";
import { User } from "@/utils/types";

type AppContext = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AppContext = React.createContext<AppContext | undefined>(undefined);

function returnInitialState(storageKey: string) {
  try {
    // Get from local storage by key
    const item = window.localStorage.getItem(storageKey);
    // Parse stored json or if none return an empty object
    return item ? JSON.parse(item) : {};
  } catch (error) {
    // If error also return an empty object
    console.log(error);
    return {};
  }
}

function useLocalStorage(storageKey: string) {
  const [storedValue, setStoredValue] = useState(
    returnInitialState(storageKey)
  );

  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save to local storage
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      // Save state
      setStoredValue(valueToStore);
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

function useLoginStatus(
  status: string
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [statusString, setStatusString] = useLocalStorage(
    returnInitialState(status)
  );

  const storedStatus = statusString === "true" ? true : false;

  const setStatus = (value: SetStateAction<boolean>) => {
    try {
      if (typeof value === "function") {
        setStatusString(value(storedStatus) ? "true" : "false");
      } else {
        setStatusString(value ? "true" : "false");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedStatus, setStatus];
}

/**
 * AppContextProvider is a React Context Provider component that provides
 * the application context to its child components.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @return {JSX.Element} The AppContext.Provider component with the
 *                       application context value and the Toaster component.
 */
export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  // State variables to manage the login status and user information.
  const [isLoggedIn, setIsLoggedIn] = useLoginStatus("loginStatus");
  const [user, setUser] = useLocalStorage("userState");

  /**
   * Renders the AppContext.Provider component with the application context value
   * and the Toaster component as its children.
   *
   * @return {JSX.Element} The AppContext.Provider component.
   */
  return (
    <AppContext.Provider
      value={{
        isLoggedIn, // The current login status.
        setIsLoggedIn, // The function to update the login status.
        user, // The current user information.
        setUser, // The function to update the user information.
      }}
    >
      {children} {/* The child components. */}
      <Toaster /> {/* The Toaster component to display toast notifications. */}
    </AppContext.Provider>
  );
};

/**
 * Custom hook that provides access to the application context.
 *
 * @return {AppContext} The application context object.
 * @throws {Error} If the hook is not used within an AppContextProvider.
 */
export const useAppContext = (): AppContext => {
  // Get the application context from the React Context API.
  const context = useContext(AppContext);

  // If the context is undefined, it means the hook is not used within an
  // AppContextProvider. Throw an error to indicate this.
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  // Return the application context.
  return context as AppContext;
};
