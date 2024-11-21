import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import logo from "/eventhub-logo.png";
import { Button } from "@/components/shadcn/ui/button";
import { useState } from "react";
import * as apiClient from "@/utils/api-client";
import { useMutation } from "react-query";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "@/components/shadcn/ui/use-toast";
import { ArrowLeft } from "lucide-react";

export type CreateEventFormData = {
  eventName: string;
  password: string;
  scheduledDate: string;
  scheduledTime: string;
};

const HostCreateEvent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>();

  const navigate = useNavigate();
  const labelFormat = "flex flex-col text-lg";
  const subDivFormat = "grid grid-cols-1 gap-4 max-w-md w-full mx-auto";
  const inputFieldFormat =
    "border rounded py-2 px-3.5 my-2 font-sans font-medium text-black text-lg";
  const errorTextFormat = "text-red-500";

  const mutation = useMutation(apiClient.createEvent, {
    onSuccess: (data) => {
      setIsLoading(false);
      console.log(data);
      toast({
        title: "Success",
        description: "Event Created Successfully! Redirecting...",
      });
      navigate(`/event/${data.data.code}`);
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: "Creation Error",
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

  return (
    <div className="bg-[#08081d] min-h-screen w-screen flex flex-col items-center justify-center text-white relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        onClick={() => navigate("/host")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="EventHub Logo"
          className="py-2 max-w-[800px] w-full cursor-pointer"
          onClick={() => navigate("/host")}
        />
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold font-alatsi mt-4 inline-block">
          Event Details
        </h1>
        <div className="border-t border-gray-600 mt-4 w-full max-w-[calc(100%+5rem)] mx-auto"></div>
      </div>
      <form
        className="align-center font-medium px-4 py-4 container"
        onSubmit={onFormSubmit}
      >
        {/* Event Details */}
        <div className={subDivFormat}>
          <label className={labelFormat}>
            Event Name
            <input
              className={inputFieldFormat}
              {...register("eventName", {
                required: "This field is required",
              })}
            />
            {errors.eventName && (
              <span className={errorTextFormat}>
                {errors.eventName.message}
              </span>
            )}
          </label>
          <label className={labelFormat}>
            Password
            <input
              type="password"
              className={inputFieldFormat}
              {...register("password", {
                required: "This field is required",
              })}
            />
            {errors.password && (
              <span className={errorTextFormat}>{errors.password.message}</span>
            )}
          </label>
          <label className={labelFormat}>
            Scheduled Date
            <input
              type="date"
              className={inputFieldFormat}
              {...register("scheduledDate", {
                required: "This field is required",
              })}
            />
            {errors.scheduledDate && (
              <span className={errorTextFormat}>
                {errors.scheduledDate.message}
              </span>
            )}
          </label>
          <label className={labelFormat}>
            Scheduled Time
            <input
              type="time"
              className={inputFieldFormat}
              {...register("scheduledTime", {
                required: "This field is required",
              })}
            />
            {errors.scheduledTime && (
              <span className={errorTextFormat}>
                {errors.scheduledTime.message}
              </span>
            )}
          </label>
          <Button
            type="submit"
            variant="secondary"
            className="mt-4 font-alatsi text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                Creating Event...
              </div>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HostCreateEvent;
