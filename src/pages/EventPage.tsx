import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";
import LiveIndicator from "./components/LiveIndicator";
import {
  ModuleAction,
  ModuleConnection,
  sendModuleAction,
  sendStreamStatus,
  StreamConnection,
} from "@/utils/messaging-client";
import { streamStorage, StreamStatus } from "@/utils/streamStorage";
import { useAppContext } from "@/contexts/AppContext";
import { Components, ComponentItem } from "@/data/componentData";
import HostSidebar from "./host/HostSidebar";
import HostMainStage from "./host/HostMainStage";

const EventPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentComponent, setCurrentComponent] =
    useState<ComponentItem | null>(null);
  const [components, setComponents] = useState<ComponentItem[]>(Components);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>(() => {
    // Initialize from localStorage, but update sessionId
    const stored = streamStorage.getStreamStatus();
    const initialStatus = {
      ...stored,
      sessionId: roomId,
    };
    streamStorage.setStreamStatus(initialStatus);
    return initialStatus;
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
        const newStatus = streamStorage.updateStreamStatus({ isLive });
        setStreamStatus(newStatus);
      },
    });
    return cleanupWebSocket;
  }, [roomId]);

  useEffect(() => {
    const cleanupStreamWebSocket = StreamConnection({
      roomID: roomId ?? "",
      onReceived: (status) => {
        console.log("Received StatusMessage:", status);
        let updates: Partial<StreamStatus> = {};

        if (status.TYPE === "VIEWER_JOIN" || status.TYPE === "VIEWER_LEAVE") {
          updates.viewerCount = status.VIEWER_COUNT || 0;
        } else if (status.TYPE === "START_STREAM") {
          updates.isLive = true;
        } else if (status.TYPE === "STOP_STREAM") {
          updates.isLive = false;
        }

        if (Object.keys(updates).length > 0) {
          const newStatus = streamStorage.updateStreamStatus(updates);
          setStreamStatus(newStatus);
        }
      },
    });
    return cleanupStreamWebSocket;
  }, [roomId]);

  const handleGoLive = () => {
    const newStatus = !streamStatus.isLive;
    const updatedStatus = streamStorage.updateStreamStatus({
      isLive: newStatus,
    });
    setStreamStatus(updatedStatus);

    sendStreamStatus({
      TYPE: newStatus ? "START_STREAM" : "STOP_STREAM",
      SESSION_ID: roomId,
      IS_LIVE: newStatus,
    });
    sendModuleAction({
      ID: currentComponent?.id ?? "",
      TYPE: currentComponent?.type ?? "",
      SESSION_ID: roomId ?? "",
      SENDER: user?.username ?? "",
      TIMESTAMP: new Date().toISOString(),
      IS_LIVE: streamStatus.isLive,
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
