import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Gamepad2, Dices, Grid3X3, Calculator, Clock } from "lucide-react";
import Battleship from "../components/game/Battleship";
import Checkers from "../components/game/Checkers";
import Tetris from "../components/game/Tetris";
import Game2048 from "../components/game/2048";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/shadcn/ui/button";
import Connections from "../components/game/Connections/Connections";

type RoomDetails = {
  id: number;
  reminderEmailSent: boolean;
  eventName: string;
  code: string;
  password: string;
  scheduledDate: string; 
  scheduledTime: string; 
  createdDate: string;
};

const WaitingRoomPage: React.FC = () => {
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [eventStarted, setEventStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const navigate = useNavigate();

  const getEvent = async (eventCode: string): Promise<RoomDetails> => {
    const response = await fetch(
      `http://localhost:8080/api/event/get/${eventCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to fetch event details");
    }
    return response.json();
  };

  const joinEvent = () => {
    navigate(`/viewer/${roomId}`);
  };

  useEffect(() => {
    // Fetch event details when component mounts
    if (roomId) {
      getEvent(roomId)
        .then((data) => {
          setRoomDetails(data);

          // Parse and calculate time left
          const eventDateTime = new Date(
            `${data.scheduledDate}T${data.scheduledTime}`
          );
          const timer = setInterval(() => {
            const now = new Date();
            const difference = eventDateTime.getTime() - now.getTime();

            if (difference > 0) {
              const hours = Math.floor(difference / (1000 * 60 * 60));
              const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60)
              );
              const seconds = Math.floor((difference % (1000 * 60)) / 1000);
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
              setTimeLeft("Event has started!");
              setEventStarted(true);
              clearInterval(timer);
            }
          }, 1000);

          return () => clearInterval(timer);
        })
        .catch((error) =>
          console.error("Error fetching event details:", error)
        );
    }
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
      <div className="container mx-auto p-8">
        <div className="text-center mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Event Waiting Room
          </h1>
          <div className="flex items-center justify-center space-x-2 text-2xl text-blue-400">
            <Clock className="w-6 h-6" />
            <span>Time until event: {timeLeft}</span>
          </div>
          {roomDetails && (
            <p className="mt-2 text-gray-300">
              Event: {roomDetails.eventName} <br />
              Scheduled Start: {roomDetails.scheduledDate} at{" "}
              {roomDetails.scheduledTime}
            </p>
          )}
          {eventStarted && (
            <Button className="my-4 font-semibold text-lg" onClick={joinEvent}>
              Join Event!
            </Button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Play some games while you wait!
          </h2>
          <Tabs defaultValue="battleship" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger
                value="battleship"
                className="text-lg flex items-center justify-center"
              >
                <Grid3X3 className="mr-2" /> Battleship
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="text-lg flex items-center justify-center"
              >
                <Gamepad2 className="mr-2" /> Connections
              </TabsTrigger>
              <TabsTrigger
                value="tetris"
                className="text-lg flex items-center justify-center"
              >
                <Dices className="mr-2" /> Tetris
              </TabsTrigger>
              <TabsTrigger
                value="2048"
                className="text-lg flex items-center justify-center"
              >
                <Calculator className="mr-2" /> 2048
              </TabsTrigger>
            </TabsList>

            <div className="game-content bg-gray-800 p-6 rounded-lg shadow-lg">
              <TabsContent value="battleship">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Battleship</CardTitle>
                    <CardDescription>
                      Classic 1 vs 1 game. Beat the AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Battleship />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <Card>
                  <CardHeader>
                    <CardTitle>Connections</CardTitle>
                    <CardDescription>
                      Create four groups of four
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Connections />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tetris">
                <Card>
                  <CardHeader>
                    <CardTitle>Tetris</CardTitle>
                    <CardDescription>
                      Arrange falling blocks to clear lines!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tetris />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="2048">
                <Card>
                  <CardHeader>
                    <CardTitle>2048</CardTitle>
                    <CardDescription>
                      Merge tiles to reach 2048!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Game2048 />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;
