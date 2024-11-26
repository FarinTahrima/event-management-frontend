import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";
import LiveIndicator from "./components/LiveIndicator";
import {
  ModuleAction,
  ModuleConnection,
  sendModuleAction,
  sendStreamStatus,
  StreamConnection,
  StreamStatus,
} from "@/utils/messaging-client";
import { useAppContext } from "@/contexts/AppContext";
import VideoJSSynced from "@/components/VideoJSSynced";
import {
  Components,
  ComponentItem,
  videoSource,
  SlideItem,
} from "@/data/componentData";
import PollComponent from "./components/PollComponent";
import SlideShow from "./components/SlideShow";
import Whiteboard from "./components/Whiteboard";
import InteractiveQAComponent from "./components/InteractiveQA";
import HostSidebar from "./host/HostSidebar";
import { PollResponse } from "./host/HostCreatePoll";
import HostMainStage from "./host/HostMainStage";

const videoJSOptions = {
  sources: [
    {
      // src: data.videoSource,
      src: videoSource,
      type: "application/x-mpegURL",
    },
  ],
};

// const HostMainStage = (props: HostMainStageProps) => {
//   return (
//     <div className="flex-[3] p-6 h-full overflow-hidden">
//       <Droppable droppableId="main-stage">
//         {(provided, snapshot) => (
//           <Card
//             ref={provided.innerRef}
//             {...provided.droppableProps}
//             className={`h-full flex flex-col items-center justify-center bg-gray-800 transition-colors ${snapshot.isDraggingOver ? "border-2 border-blue-500" : ""}`}
//           >
//             {props.currentComponent ? (
//               <div className="text-center p-2 w-full h-full flex flex-col place-content-center">
//                 <h2 className="text-xl font-semibold mb-4 text-white">
//                   {props.currentComponent.title}
//                 </h2>
//                 {props.currentComponent.type === "slide" &&
//                   props.currentComponent.images && (
//                     <div className="w-full h-full ">
//                       <SlideShow
//                         images={props.currentComponent.images}
//                         isHost={true}
//                         currentIndex={props.currentSlideIndex}
//                         onSlideChange={(index) => {
//                           props.setCurrentSlideIndex(index);
//                           sendModuleAction({
//                             ID: props.currentComponent?.id ?? "",
//                             TYPE: "slide_change",
//                             SESSION_ID: props.roomId ?? "",
//                             SENDER: props.user?.username ?? "",
//                             TIMESTAMP: new Date().toISOString(),
//                             CONTENT: JSON.stringify({
//                               slideIndex: index,
//                             }),
//                             IS_LIVE: props.isLive,
//                           });
//                         }}
//                       />
//                     </div>
//                   )}
//                 {props.currentComponent.htmlContent &&
//                   !props.currentComponent.imageUrl && (
//                     <div className="max-w-full max-h-full overflow-auto">
//                       {props.currentComponent.htmlContent}
//                     </div>
//                   )}
//                 {props.currentComponent.type === "video" && (
//                   <div className="flex justify-center items-center w-full h-full">
//                     <VideoJSSynced
//                       options={videoJSOptions}
//                       roomID={props.roomId ?? ""}
//                       isHost={true}
//                       className="w-full h-full max-w-[80%] max-h-[80%] flex justify-center items-center"
//                     />
//                   </div>
//                 )}
//                 {props.currentComponent.type === "poll" && props.roomId && (
//                   <PollComponent isHost={true} roomId={props.roomId} />
//                 )}
//                 {props.currentComponent.type === "whiteboard" &&
//                   props.roomId && <Whiteboard isHost roomId={props.roomId} />}
//                 {props.currentComponent.type === "interactive-qa" &&
//                   props.roomId && (
//                     <InteractiveQAComponent roomId={props.roomId} isHost />
//                   )}
//                 {props.currentComponent.content && (
//                   <p className="text-white mb-4">
//                     {props.currentComponent.content}
//                   </p>
//                 )}
//               </div>
//             ) : (
//               <div
//                 className={`text-gray-400 text-center ${snapshot.isDraggingOver ? "text-blue-400" : ""}`}
//               >
//                 {snapshot.isDraggingOver
//                   ? "Drop component here"
//                   : "Drag a component here or select from the sidebar"}
//               </div>
//             )}
//             {provided.placeholder}
//           </Card>
//         )}
//       </Droppable>
//     </div>
//   );
// };

const EventPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentComponent, setCurrentComponent] =
    useState<ComponentItem | null>(null);
  const [components, setComponents] = useState<ComponentItem[]>(Components);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewerCount: 0,
    sessionId: roomId,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAppContext();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const cleanupWebSocket = ModuleConnection({
      roomID: roomId ?? "",
      onReceived: (action: ModuleAction) => {
        console.log("Received ModuleAction:", action);
        const component = Components.find(
          (component) => component.id === action.ID
        );
        if (component) {
          setCurrentComponent(component);
        }
      },
      goLive: (isLive: boolean) => {
        setStreamStatus((prev) => ({ ...prev, isLive }));
      },
    });
    return cleanupWebSocket;
  }, [roomId]);

  useEffect(() => {
    const cleanupStreamWebSocket = StreamConnection({
      roomID: roomId ?? "",
      onReceived: (status) => {
        console.log("Received StatusMessage:", status);
        if (status.TYPE === "VIEWER_JOIN") {
          setStreamStatus((prev) => ({
            ...prev,
            viewerCount: status.VIEWER_COUNT || 0,
          }));
        } else if (status.TYPE === "VIEWER_LEAVE") {
          setStreamStatus((prev) => ({
            ...prev,
            viewerCount: status.VIEWER_COUNT || 0,
          }));
        } else if (status.TYPE === "START_STREAM") {
          setStreamStatus((prev) => ({ ...prev, isLive: true }));
        } else if (status.TYPE === "STOP_STREAM") {
          setStreamStatus((prev) => ({ ...prev, isLive: false }));
        }
      },
    });
    return cleanupStreamWebSocket;
  }, [roomId]);

  const handleGoLive = () => {
    const newStatus = !streamStatus.isLive;
    setStreamStatus((prev) => ({ ...prev, isLive: newStatus }));
    sendStreamStatus({
      TYPE: newStatus ? "START_STREAM" : "STOP_STREAM",
      SESSION_ID: roomId,
      IS_LIVE: newStatus,
    });
  };

  const handleComponentClick = (component: ComponentItem) => {
    setCurrentComponent(component);
    sendModuleAction({
      ID: component.id,
      TYPE: component.type,
      SESSION_ID: roomId ?? "",
      SENDER: user?.username ?? "",
      TIMESTAMP: new Date().toISOString(),
      IS_LIVE: streamStatus.isLive,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    if (result.destination.droppableId === "main-stage") {
      const draggedComponent = components[result.source.index];
      setCurrentComponent(draggedComponent);
      sendModuleAction({
        ID: draggedComponent.id,
        TYPE: draggedComponent.type,
        SESSION_ID: roomId ?? "",
        SENDER: user?.username ?? "",
        TIMESTAMP: new Date().toISOString(),
        IS_LIVE: streamStatus.isLive,
      });
      return;
    }
    if (result.destination.droppableId === "components") {
      const items = Array.from(components);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setComponents(items);
    }
  };

  const handleAddComponent = (componentToAdd: ComponentItem) => {
    const newId = (components.length + 1).toString();
    const newComponent = { ...componentToAdd, id: newId };
    setComponents([...components, newComponent]);
    setCurrentComponent(newComponent);
    setIsAddDialogOpen(false);
  };

  const handleDeleteComponent = (id: string) => {
    const updatedComponents = components.filter(
      (component) => component.id !== id
    );
    setComponents(updatedComponents);
    if (currentComponent && currentComponent.id === id) {
      setCurrentComponent(updatedComponents[0] || null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <Button
            onClick={handleBack}
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 mr-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex-1 flex justify-between items-center">
            <LiveIndicator {...streamStatus} />
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGoLive}
                variant={streamStatus.isLive ? "destructive" : "default"}
              >
                {streamStatus.isLive ? "End Stream" : "Go Live"}
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          {/* Main Stage */}
          <HostMainStage
            roomId={roomId ?? ""}
            currentComponent={currentComponent ?? undefined}
            isLive={streamStatus.isLive}
            user={user}
            currentSlideIndex={currentSlideIndex}
            setCurrentSlideIndex={setCurrentSlideIndex}
          ></HostMainStage>

          {/* Right Sidebar */}
          <HostSidebar
            roomId={roomId}
            navigate={navigate}
            currentComponent={{ id: currentComponent?.id }}
            components={components}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            handleComponentClick={handleComponentClick}
            handleAddComponent={handleAddComponent}
            handleDeleteComponent={handleDeleteComponent}
          ></HostSidebar>
        </div>
      </DragDropContext>
    </div>
  );
};

export default EventPage;
