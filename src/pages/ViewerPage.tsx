import { Card } from "@/components/shadcn/ui/card";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import LiveChat from "@/components/LiveChat";
import Chatbot from "@/components/experimental/AIchatbot";
import LiveIndicator from "./components/LiveIndicator";
import RoomDetailsComponent from "./components/RoomDetail";
import {
  ModuleAction,
  ModuleConnection,
  StreamConnection,
  StreamStatus,
} from "@/utils/messaging-client";
import { useParams } from "react-router-dom";
import { ComponentItem, Components, videoSource } from "../data/componentData";
import { getCurrentModule, getStreamStatus } from "@/utils/api-client";
import VideoJSSynced from "@/components/VideoJSSynced";
import { useCallback, useEffect, useState } from "react";
import PollComponent from "./components/PollComponent";
import ViewerSideQuestionComponent from "./components/ViewerSideQuestionComponent";
import Whiteboard from "./components/Whiteboard";
import SlideShow from "./components/SlideShow";
import { SelectedQuestionDisplay } from "./components/InteractiveQA";
import { ChevronUp, ChevronDown, Info } from "lucide-react";

const ViewerPage: React.FC = () => {
  const [currentComponent, setCurrentComponent] =
    useState<ComponentItem | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewerCount: 0,
  });
  const [isRoomDetailsExpanded, setIsRoomDetailsExpanded] = useState(true);
  const { roomId } = useParams();
  const roomID = roomId ? roomId.toString() : "";

  // Handler for module actions that considers stream status
  const handleModuleAction = useCallback(
    (action: ModuleAction) => {
      console.log("Received ModuleAction:", action);

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
        // Only fetch and set initial module if stream is live
        if (streamStatus.isLive) {
          const currentModule: ModuleAction = await getCurrentModule(roomID);
          const component = Components.find(
            (component) => component.id === currentModule.ID
          );
          console.log("currentModule: ", currentModule);
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

  const videoJSOptions = {
    sources: [
      {
        src: videoSource,
        type: "application/x-mpegURL",
      },
    ],
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
          <Card className="h-full flex items-center justify-center bg-gray-800 scale-100">
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
                  <PollComponent isHost={false} roomId={roomId} />
                )}
                {currentComponent.type === "whiteboard" && roomId && (
                  <Whiteboard isHost={false} roomId={roomId} />
                )}
                {currentComponent.type === "interactive-qa" && roomId && (
                  <div className="h-55">
                    <SelectedQuestionDisplay isHost={false} />
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
                <Info className="w-6 h-6 text-blue-400" />
                <span className="font-semibold">Event Details</span>
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

          {/* Questions Section - Fixed height */}
          <div className="min-h-[26rem] border-y border-gray-700">
            <ViewerSideQuestionComponent
              isLive={streamStatus.isLive}
              roomId={roomID}
            />
          </div>

          {/* Live Chat Section - Takes remaining space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="h-full">
              <LiveChat />
            </ScrollArea>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default ViewerPage;
