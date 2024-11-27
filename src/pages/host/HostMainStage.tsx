import { Card } from "@/components/shadcn/ui/card";
import { Droppable } from "@/components/shadcn/ui/dnd";
import { ComponentItem, videoSource } from "@/data/componentData";
import SlideShow from "../components/SlideShow";
import { sendModuleAction } from "@/utils/messaging-client";
import VideoJSSynced from "@/components/VideoJSSynced";
import PollComponent from "../components/PollComponent";
import Whiteboard from "../components/Whiteboard";
import InteractiveQAComponent from "../components/InteractiveQA";

type HostMainStageProps = {
  currentSlideIndex: number;
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  roomId: string;
  user: any;
  isLive: boolean;
  currentComponent?: ComponentItem;
};

const videoJSOptions = {
  sources: [
    {
      // src: data.videoSource,
      src: videoSource,
      type: "application/x-mpegURL",
    },
  ],
};

const HostMainStage = (props: HostMainStageProps) => {
  return (
    <div className="flex-[3] p-6 h-full overflow-hidden">
      <Droppable droppableId="main-stage">
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`h-full flex flex-col items-center justify-center bg-gray-800 transition-colors ${snapshot.isDraggingOver ? "border-2 border-blue-500" : ""}`}
          >
            {props.currentComponent ? (
              <div className="text-center p-2 w-full h-full flex flex-col place-content-center">
                {props.currentComponent.type === "slide" &&
                  props.currentComponent.images && (
                    <div className="w-full h-full ">
                      <SlideShow
                        images={props.currentComponent.images}
                        isHost={true}
                        currentIndex={props.currentSlideIndex}
                        onSlideChange={(index) => {
                          props.setCurrentSlideIndex(index);
                          sendModuleAction({
                            ID: props.currentComponent?.id ?? "",
                            TYPE: "slide_change",
                            SESSION_ID: props.roomId ?? "",
                            SENDER: props.user?.username ?? "",
                            TIMESTAMP: new Date().toISOString(),
                            CONTENT: JSON.stringify({
                              slideIndex: index,
                            }),
                            IS_LIVE: props.isLive,
                          });
                        }}
                      />
                    </div>
                  )}
                {props.currentComponent.htmlContent &&
                  !props.currentComponent.imageUrl && (
                    <div className="max-w-full max-h-full overflow-auto">
                      {props.currentComponent.htmlContent}
                    </div>
                  )}
                {props.currentComponent.type === "video" && (
                  <div className="flex justify-center items-center w-full h-full">
                    <VideoJSSynced
                      options={videoJSOptions}
                      roomID={props.roomId ?? ""}
                      isHost={true}
                      className="w-full h-full max-w-[80%] max-h-[80%] flex justify-center items-center"
                    />
                  </div>
                )}
                {props.currentComponent.type === "poll" && props.roomId && (
                  <PollComponent isHost={true} roomId={props.roomId} />
                )}
                {props.currentComponent.type === "whiteboard" &&
                  props.roomId && <Whiteboard isHost roomId={props.roomId} />}
                {props.currentComponent.type === "interactive-qa" &&
                  props.roomId && (
                    <InteractiveQAComponent roomId={props.roomId} isHost />
                  )}
                {/* {props.currentComponent.content && (
                  <p className="text-white mb-4">
                    {props.currentComponent.content}
                  </p>
                )} */}
              </div>
            ) : (
              <div
                className={`text-gray-400 text-xl text-center ${snapshot.isDraggingOver ? "text-blue-400" : ""}`}
              >
                {snapshot.isDraggingOver
                  ? "Drop component here"
                  : "Drag a component here or select from the sidebar"}
              </div>
            )}
            {provided.placeholder}
          </Card>
        )}
      </Droppable>
    </div>
  );
};

export default HostMainStage;
