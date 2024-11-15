import { LoginFormData } from "../pages/host/HostLoginPage.tsx";
import { RegisterFormData } from "../pages/host/HostRegisterPage.tsx";
import axios from "axios";
import { User } from "@/utils/types";
import { CreateEventFormData } from "@/pages/host/HostCreateEvent.tsx";
import { StatusMessage } from "@/pages/ViewerPage.tsx";
import { PollRequestData } from "@/components/PollForm.tsx";
import {
  PollResponse,
  PollResponseData,
} from "@/pages/host/HostCreatePoll.tsx";

const API_BASE_URL = "http://localhost:8080";
const EXPRESS_BASE_URL = "http://localhost:3000";

export const register = async (formData: RegisterFormData) => {
  const response = await axios
    .post(`${API_BASE_URL}/account/api/registration/submit`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
    .then((response) => {
      console.log("returning data from apiclient");
      return response.data;
    })
    .catch((error) => {
      // Error handling code remains the same
      throw new Error(error.message);
    });

  return response;
};

export const login = async (formData: LoginFormData): Promise<User> => {
  const response = await axios
    .post(
      `${API_BASE_URL}/account/api/login/submit`,
      {
        username: formData.username,
        password: formData.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      // Error handling code remains the same
      throw new Error(error.message);
    });
  // const fullUserInfo = await getFullAccountInfo(response.data.id);
  // return { ...response.data, ...fullUserInfo };
  return { ...response.data };
};

export const getFullAccountInfo = async (
  userId: number
): Promise<Partial<User>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/payment/user/${userId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching full account information:", error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  const response = await axios
    .delete(`${API_BASE_URL}/account/api/delete/${id}`)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export const getChatMessagesByRoomID = async (roomID: string) => {
  const data = await axios
    .get(`${API_BASE_URL}/api/messages/${roomID}`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      throw new Error(error);
    });
  if (data === null || data === undefined) {
    console.log("data is null or undefined");
    return [];
  } else {
    return data;
  }
};

export const createOrGetCustomer = async (email: string) => {
  console.log("Creating or getting customer for email:", email);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payment/create-or-get-customer`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Create or get customer response:", response.data);
    return response.data.customerId;
  } catch (error) {
    console.error("Error in createOrGetCustomer:", error);
    throw error;
  }
};

export const createSubscription = async (customerId: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payment/create-subscription`,
      { customerId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Create subscription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payment/cancel-subscription`,
      { subscriptionId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Cancel subscription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in cancelSubscription:", error);
    throw error;
  }
};

export const getSubscriptionStatus = async (email: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/payment/subscription/status?email=${email}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Get subscription status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getSubscriptionStatus:", error);
    throw error;
  }
};

export const sendChatMessage = async (userInput: string) => {
  try {
    const response = await axios.post(
      `${EXPRESS_BASE_URL}/generate-ai`,
      { prompt: userInput },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("Chat response:", response.data);
    return response.data.response;
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
    }
    throw new Error(
      "Failed to send message. Please check your network connection and try again."
    );
  }
};

export const createEvent = async (formData: CreateEventFormData) => {
  const response = await axios
    .post(
      `${API_BASE_URL}/api/event/create`,
      {
        eventName: formData.eventName,
        accountID: "1",
        password: formData.password,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
  return response;
};

export const getEvents = async (accountID: string) => {
  const response = await axios
    .get(`${API_BASE_URL}/api/event/getByUserId/${accountID}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
  return response;
};

export const getStreamStatus = async (roomId: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/streamStatus/${roomId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stream status information:", error);
    throw error;
  }
};
export const createPoll = async (
  pollData: PollRequestData
): Promise<PollResponseData> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/poll/create`,
      pollData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    // Error handling code remains the same
    throw error;
  }
};

export const getEventPoll = async (
  code: string,
  userDisplayName: string
): Promise<PollResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/poll/get-event-poll-by-code`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        params: {
          code,
          userDisplayName,
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    // Error handling code remains the same
    throw error;
  }
};

export const uploadImage = async (
  image: File,
  fileName: string,
  directory: string
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("fileName", fileName);
    formData.append("directory", directory);
    const response = await axios.post(
      `${API_BASE_URL}/api/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    // Error handling code remains the same
    throw error;
  }
};

export const addVote = async (
  pollId: number,
  pollOptionId: number,
  userDisplayName: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/vote/create`, null, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      params: {
        pollId,
        pollOptionId,
        userDisplayName,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    // Error handling code remains the same
    throw error;
  }
};

export const changeVote = async (
  pollId: number,
  newPollOptionId: number,
  userDisplayName: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/vote/change`, null, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      params: {
        pollId,
        newPollOptionId,
        userDisplayName,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
