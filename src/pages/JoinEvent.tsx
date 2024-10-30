import { Button } from "@/components//ui/button";
import { toast } from "@/components//ui/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { set, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as apiClient from "@/utils/api-client";
import { User } from "@/utils/types";
import WordleLoginButton from "@/components/WordleLoginButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export type LoginFormData = {
  username: string;
  password: string;
};

const HostLoginPage = () => {
  const { setIsLoggedIn, setUser } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const mutation = useMutation<User, Error, LoginFormData>(apiClient.login, {
    onSuccess: (data) => {
      setIsLoading(false);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      setUser(data);
      setIsLoggedIn(true);
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const onFormSubmit = handleSubmit((data) => {
    setIsLoading(true);
    mutation.mutate(data);
  });

  const mainDivFormat = "text-white font-alatsi justify-center w-full";
  const inputFieldFormat =
    "border rounded py-2 px-3.5 my-2 font-sans font-medium text-black text-lg";
  const errorTextFormat = "text-red-500";
  const labelFormat = "flex flex-col";
  const subDivFormat = "grid grid-cols-2 gap-5";

  return (
    <div className={mainDivFormat}>
      <h1 className="text-2xl text-white px-4 text-center">Welcome Back!</h1>

      <form
        className="text-white align-center font-medium px-4 py-4"
        onSubmit={onFormSubmit}
      >
        <div className={subDivFormat}>
          <label className={labelFormat}>
            Test Join Event Code (Not Done)
            <input
              className={inputFieldFormat}
              {...register("username", {
                required: "This field is required",
              })}
            />
            {errors.username && (
              <span className={errorTextFormat}>{errors.username.message}</span>
            )}
          </label>

          <label className={labelFormat}>
            Test Join Event Password (Not Done)
            <input
              className={inputFieldFormat}
              {...register("password", {
                required: "This field is required",
              })}
              type="password"
            />
            {errors.password && (
              <span className={errorTextFormat}>{errors.password.message}</span>
            )}
          </label>
        </div>

        <div className="text-center">
          <Button
            type="submit"
            variant="secondary"
            className="my-4 font-alatsi text-base"
          >
            Login
          </Button>
        </div>
      </form>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center bg-black bg-opacity-70">
          <h2 className="text-s font-bold font-alatsi">Loading</h2>
          <LoadingSpinner className="size-12 my-2" />
        </div>
      )}

      <div className="text-center">
        <WordleLoginButton />
      </div>
    </div>
  );
};

export default HostLoginPage;
