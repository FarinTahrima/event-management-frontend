import { Button } from "@/components/shadcn/ui/button";
import { toast } from "@/components/shadcn/ui/use-toast";
import logo from "/eventhub-logo.png";
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { User } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import HostLoginPage from "./host/HostLoginPage";
import HostRegisterPage from "./host/HostRegisterPage";

export type JoinEventFormData = {
  code: string;
  password: string;
  displayName: string;
};

export type JoinEventResponseData = {
  token: string;
  videoSource: string;
  roomId: string;
  host: boolean;
};

const LandingPage = () => {
  const [optionSelected, setOptionSelected] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showHostButtons, setShowHostButtons] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinEventFormData>();

  const div = `bg-[#08081d] min-h-screen w-screen flex flex-col items-center justify-center transition-all duration-300`;
  const buttonTextFormat = "text-3xl mx-8 px-8 py-6 font-alatsi";
  const TRANSITION_DURATION = 300;

  const joinEventMutation = useMutation<
    JoinEventResponseData,
    Error,
    JoinEventFormData
  >(
    async (data: JoinEventFormData) => {
      const response: Response = await fetch(
        "http://localhost:8080/api/event/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to join event");
      }
      return await response.json();
    },
    {
      onSuccess: (data: JoinEventResponseData) => {
        const { roomId: code } = data;
        setIsLoading(false);
        toast({
          title: "Success",
          description: "Joined event successfully!",
        });
        navigate(`/waiting/${code}`);
      },
      onError: (error: Error) => {
        setIsLoading(false);
        toast({
          title: "Join Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleButtonClick = (option: string) => {
    if (optionSelected === option) {
      setTransitioning(true);
      setTimeout(() => {
        setOptionSelected(null);
        setTransitioning(false);
      }, TRANSITION_DURATION);
      return;
    }

    setTransitioning(true);
    try {
      setTimeout(() => {
        setOptionSelected(option);
        setTransitioning(false);
      }, TRANSITION_DURATION);
    } catch (error) {
      console.error(`Error in handleButtonClick: ${error}`);
      setTransitioning(false);
    }
  };

  const toggleHostMode = () => {
    if (showHostButtons) {
      setTransitioning(true);
      setTimeout(() => {
        setShowHostButtons(false);
        setOptionSelected(null);
        setTransitioning(false);
      }, TRANSITION_DURATION);
    } else {
      setShowHostButtons(true);
      setOptionSelected(null);
    }
  };

  const JoinEventForm = () => {
    const inputFieldFormat =
      "border rounded py-2 px-3.5 my-2 font-sans font-medium text-white text-lg";
    const errorTextFormat = "text-red-500";
    const labelFormat = "flex flex-col";
    const subDivFormat = "grid grid-cols-1 gap-4 max-w-md w-full mx-auto";

    const onFormSubmit = handleSubmit((data) => {
      setIsLoading(true);
      setUser({
        username: data.displayName,
      });
      joinEventMutation.mutate(data);
    });

    return (
      <div className="text-white font-alatsi justify-center w-full max-w-2xl mx-auto p-6">
        <form onSubmit={onFormSubmit}>
          <div className={subDivFormat}>
            <label className={labelFormat}>
              Event Code
              <input
                className={inputFieldFormat}
                {...register("code", {
                  required: "Event code is required",
                })}
              />
              {errors.code && (
                <span className={errorTextFormat}>{errors.code.message}</span>
              )}
            </label>

            <label className={labelFormat}>
              Event Password
              <input
                className={inputFieldFormat}
                type="password"
                {...register("password", {
                  required: "Event password is required",
                })}
              />
              {errors.password && (
                <span className={errorTextFormat}>
                  {errors.password.message}
                </span>
              )}
            </label>

            <label className={labelFormat}>
              Display Name
              <input
                className={inputFieldFormat}
                {...register("displayName", {
                  required: "Display name is required",
                })}
              />
              {errors.displayName && (
                <span className={errorTextFormat}>
                  {errors.displayName.message}
                </span>
              )}
            </label>

            <Button
              type="submit"
              variant="secondary"
              className="mt-4 font-alatsi text-base"
            >
              Join Event
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const renderContent = () => {
    switch (optionSelected) {
      case "login":
        return <HostLoginPage />;
      case "register":
        return <HostRegisterPage />;
      case "join event":
        return <JoinEventForm />;
      default:
        return null;
    }
  };

  return (
    <div className={div}>
      <Button
        onClick={toggleHostMode}
        variant="ghost"
        className="absolute top-4 right-4 text-2xl px-4 py-2 bg-white text-black rounded"
      >
        {showHostButtons ? "Back" : "Host"}
      </Button>

      <div className={`flex flex-col transition-all duration-300 `}>
        <img
          src={logo}
          alt="EventHub Logo"
          className="py-2 max-w-[800px] w-full cursor-pointer"
          onClick={() => {
            handleButtonClick("");
            setShowHostButtons(false);
          }}
        />

        <div className="text-white">
          <div className="py-4 text-center">
            {!showHostButtons && (
              <Button
                onClick={() => handleButtonClick("join event")}
                variant="ghost"
                className={buttonTextFormat}
              >
                Join Event
              </Button>
            )}

            {showHostButtons && (
              <>
                <Button
                  onClick={() => handleButtonClick("login")}
                  variant="ghost"
                  className={buttonTextFormat}
                >
                  Host Login
                </Button>
                <Button
                  variant="ghost"
                  className={buttonTextFormat}
                  onClick={() => handleButtonClick("register")}
                >
                  Host Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`items-center transition-opacity duration-300 ${
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {renderContent()}
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default LandingPage;
