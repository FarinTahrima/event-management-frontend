import { Card } from "@/components/shadcn/ui/card";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import LiveChat from "@/components/LiveChat";
import Chatbot from "@/components/experimental/AIchatbot";
import LiveIndicator from "./components/LiveIndicator";
import RoomDetailsComponent from "./components/RoomDetail";
import {
  ModuleConnection,
  sendModuleAction,
  StreamConnection,
  WhiteboardConnection,
} from "@/utils/messaging-client";
import { useParams } from "react-router-dom";
import { ModuleAction, videoSource, WhiteboardAction } from "./EventPage";
import { ComponentItem, Components, Poll } from "../data/componentData";
import { getCurrentModule, getStreamStatus } from "@/utils/api-client";
import VideoJSSynced from "@/components/VideoJSSynced";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import PollComponent from "./components/PollComponent";
import QuestionComponent from "./components/QuestionComponent";
import Whiteboard, { WhiteBoardData } from "./components/Whiteboard";
import SlideShow from "./components/SlideShow";
import { Question } from "@/types/types";
import { useQuestions } from "@/contexts/QuestionContext";
import { SelectedQuestionDisplay } from "./components/PigeonComponent";
import { ChevronUp, ChevronDown, Info } from "lucide-react";

interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  roomId?: string;
}

export interface StatusMessage {
  TYPE: string;
  ID?: string;
  SESSION_ID?: string;
  VIEWER_COUNT?: number;
  IS_LIVE?: any;
}

const ViewerPage: React.FC = () => {
  const [poll, setPoll] = useState(Poll);
  const [currentComponent, setCurrentComponent] =
    useState<ComponentItem | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewerCount: 0,
  });
  const [isRoomDetailsExpanded, setIsRoomDetailsExpanded] = useState(true);
  const { roomId } = useParams();
  const roomID = roomId ? roomId.toString() : "";
  const { user } = useAppContext();
  const [pollMode, setPollMode] = useState<"vote" | "result">("vote");
  const [data, setData] = useState<WhiteBoardData>();
  const { questions } = useQuestions();
  const selectedQuestion = questions.find((q) => q.isSelected);
  const [question, setQuestion] = useState<Question | null>(
    selectedQuestion ? selectedQuestion : null
  );

  // Handler for module actions that considers stream status
  const handleModuleAction = useCallback(
    (action: ModuleAction) => {
      console.log("Received ModuleAction:", action);

      if (action.TYPE === "poll_result" && action.CONTENT) {
        setPoll(JSON.parse(action.CONTENT));
        setPollMode("result");
      }

      if (action.TYPE === "poll_view" && action.CONTENT) {
        setPoll(JSON.parse(action.CONTENT));
        setPollMode("vote");
      }

      if (action.TYPE === "select_pigeon_question" && action.CONTENT) {
        setQuestion(JSON.parse(action.CONTENT));
      }

      // Only update currentComponent if stream is live
      console.log("action.IS_LIVE (handleModuleAction): ", action.IS_LIVE);
      if (action.IS_LIVE) {
        const component = Components.find(
          (component) => component.id === action.ID
        );
        console.log(component);

        if (component) {
          if (action.TYPE.startsWith("slide") && action.CONTENT) {
            console.log(JSON.parse(action.CONTENT));
            setCurrentComponent({
              ...component,
              content: component.content ?? "",
              currentImageIndex: JSON.parse(action.CONTENT).slideIndex,
            });
          } else {
            setCurrentComponent({
              ...component,
              content: component.content ?? "",
            });
          }
        }
      }
    },
    [streamStatus.isLive]
  );

  useEffect(() => {
    const fetchStatusAndConnect = async () => {
      try {
        console.log(
          "streamStatus.isLive-2 (fetchStatus): ",
          streamStatus.isLive
        );
        // Only fetch and set initial module if stream is live
        if (streamStatus.isLive) {
          const currentModule: ModuleAction = await getCurrentModule(roomID);
          const component = Components.find(
            (component) => component.id === currentModule.ID
          );
          if (component) {
            setCurrentComponent({
              ...component,
              content: component.content ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching current module:", error);
      }

      const cleanupWebSocket = ModuleConnection({
        roomID: roomID,
        onReceived: handleModuleAction,
        goLive: (isLive: boolean) => {
          console.log(isLive);
        },
      });

      return cleanupWebSocket;
    };

    fetchStatusAndConnect();
  }, [roomId, handleModuleAction, streamStatus.isLive]);

  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;

    const fetchStreamData = async () => {
      try {
        const currentStatus = await getStreamStatus(roomID);
        console.log(currentStatus);
        setStreamStatus({
          isLive: currentStatus.isLive || currentStatus.live,
          viewerCount: currentStatus.viewerCount,
          roomId: roomID,
        });

        // Clear currentComponent if stream is not live
        if (!currentStatus.isLive) {
          setCurrentComponent(null);
        }
      } catch (error) {
        console.error("Error fetching stream data:", error);
      }

      cleanupFunction = StreamConnection({
        roomID: roomId ?? "",
        onReceived: (status) => {
          console.log("Received StatusMessage:", status);
          if (status.TYPE === "START_STREAM") {
            setStreamStatus((prev) => ({ ...prev, isLive: true }));
          } else if (status.TYPE === "STOP_STREAM") {
            setStreamStatus((prev) => ({ ...prev, isLive: false }));
            // Clear currentComponent when stream stops
            setCurrentComponent(null);
          } else if (
            status.TYPE === "VIEWER_JOIN" ||
            status.TYPE === "VIEWER_LEAVE"
          ) {
            setStreamStatus((prev) => ({
              ...prev,
              viewerCount: status.VIEWER_COUNT ?? prev.viewerCount,
            }));
          }
        },
      });
    };

    fetchStreamData();

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [roomId]);

  useEffect(() => {
    const cleanupWebSocket = WhiteboardConnection({
      roomID: roomID,
      onReceived: (action: WhiteboardAction) => {
        console.log("Received WhiteboardAction:", action);
        if (action.TYPE == "draw") {
          setData({
            type: action.TYPE,
            x: action.X,
            y: action.Y,
            color: action.COLOR,
            lineWidth: action.LINE_WIDTH,
          });
        } else if (action.TYPE == "erase") {
          setData({
            type: action.TYPE,
            x: action.X,
            y: action.Y,
            lineWidth: action.LINE_WIDTH,
          });
        } else if (action.TYPE == "change_marker_color") {
          setData({ type: action.TYPE, color: action.COLOR });
        } else if (action.TYPE == "change_marker_line_width") {
          setData({ type: action.TYPE, lineWidth: action.LINE_WIDTH });
        } else {
          setData({ type: action.TYPE });
        }
      },
    });

    return cleanupWebSocket;
  }, [roomId]);

  const videoJSOptions = {
    sources: [
      {
        src: videoSource,
        type: "application/x-mpegURL",
      },
    ],
  };

  const sendPollVote = (pollId: number, optionId: number) => {
    console.log("voting for " + optionId + " in poll with id " + pollId);
    sendModuleAction({
      ID: "54",
      TYPE: "poll_vote",
      SESSION_ID: roomId ?? "",
      SENDER: user?.username ?? "",
      TIMESTAMP: new Date().toISOString(),
      CONTENT: pollId + "_" + optionId,
      IS_LIVE: streamStatus.isLive,
    });
  };

  const toggleRoomDetails = () => {
    setIsRoomDetailsExpanded(!isRoomDetailsExpanded);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Stream Status Bar */}
      <div className="bg-gray-800 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <LiveIndicator {...streamStatus} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Stage */}
        <div className="flex-[3] p-6 h-full overflow-hidden">
          <Card className="h-full flex items-center justify-center bg-gray-800">
            {currentComponent ? (
              <div className="text-center p-2 w-full h-full flex flex-col place-content-center">
                {currentComponent.imageUrl &&
                  currentComponent.type !== "slide" &&
                  !currentComponent.htmlContent && (
                    <img
                      src={currentComponent.imageUrl}
                      alt={currentComponent.title}
                      className="mx-auto mb-4 rounded-lg shadow-md"
                    />
                  )}
                {currentComponent.type.startsWith("slide") &&
                  currentComponent.images && (
                    <SlideShow
                      images={currentComponent.images}
                      currentIndex={
                        currentComponent.currentImageIndex
                          ? currentComponent.currentImageIndex
                          : 0
                      }
                      isHost={false}
                    />
                  )}
                {currentComponent.htmlContent && !currentComponent.imageUrl && (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="max-w-4xl w-full">
                      {currentComponent.htmlContent}
                    </div>
                  </div>
                )}
                {currentComponent.type === "video" && (
                  <VideoJSSynced
                    options={videoJSOptions}
                    roomID={roomId ?? ""}
                    isHost={false}
                    className="w-full h-full flex justify-center items-center py-4"
                  />
                )}
                {currentComponent.type === "poll" && roomId && (
                  <PollComponent
                    poll={poll}
                    setPoll={setPoll}
                    isHost={false}
                    roomId={roomId}
                    onVoteSubmit={sendPollVote}
                    pollMode={pollMode}
                    setPollMode={setPollMode}
                  />
                )}
                {currentComponent.type === "whiteboard" && roomId && (
                  <Whiteboard isHost={false} data={data} setData={setData} />
                )}
                {currentComponent.type === "pigeon-hole" &&
                  roomId &&
                  question && (
                    <div className="h-55">
                      <SelectedQuestionDisplay question={question} />
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-gray-400">
                Waiting for presenter to share content...
              </p>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 bg-gray-800 shadow-lg flex flex-col h-full">
          {/* Room Details Section */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isRoomDetailsExpanded ? "h-[200px]" : "h-[40px]"
            }`}
          >
            <div
              className="flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-700"
              onClick={toggleRoomDetails}
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Room Details</span>
              </div>
              {isRoomDetailsExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isRoomDetailsExpanded ? "h-[calc(200px-40px)]" : "h-0"
              }`}
            >
              <ScrollArea className="h-full">
                <RoomDetailsComponent />
              </ScrollArea>
            </div>
          </div>

          {/* Questions Section */}
          <div className="flex-1 border-y border-gray-700 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <QuestionComponent isHost={false} />
              </ScrollArea>
            </div>
          </div>

          {/* Live Chat Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <LiveChat />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default ViewerPage;
