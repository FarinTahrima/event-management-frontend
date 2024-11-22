import { Calendar, Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface RoomDetails {
  id: number;
  reminderEmailSent: boolean;
  eventName: string;
  code: string;
  password: string;
  scheduledDate: string;
  scheduledTime: string;
  createdDate: string;
}

const RoomDetailsComponent: React.FC = () => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const { roomId } = useParams();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/event/get/${roomId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch room details");
        }

        const data = await response.json();
        setRoomDetails(data);
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  if (!roomDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-4 text-gray-400">Loading room details...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="space-y-3">
        <div className="flex items-center text-gray-200">
          <span className="font-medium">Event Name:</span>
          <span className="ml-2">{roomDetails.eventName}</span>
        </div>
        <div className="flex items-center text-gray-200">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-medium">Date:</span>
          <span className="ml-2">{roomDetails.scheduledDate}</span>
        </div>
        <div className="flex items-center text-gray-200">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-medium">Time:</span>
          <span className="ml-2">{roomDetails.scheduledTime}</span>
        </div>
        <div className="flex items-center text-gray-200">
          <span className="font-medium">Room Code:</span>
          <span className="ml-2">{roomDetails.code}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsComponent;