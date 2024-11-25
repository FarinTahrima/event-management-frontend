import { Button } from "@/components/shadcn/ui/button";
import { useRef, useState, useEffect } from "react";
import { MousePointer2, Pen, Eraser } from 'lucide-react';
import "@/index.css";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { sendWhiteboardAction, WhiteboardAction, WhiteboardConnection } from "@/utils/messaging-client";

interface WhiteboardProps {
    isHost: boolean;
    roomId: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ isHost, roomId}) => {
  const markerColors = ["#000000", "#0000ff", "#008000", "#ff0000"];
  const lineWidths = [1, 3, 5, 10];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorMode, setCursorMode] = useState(isHost ? "pen" : "pointer"); //for viewers it will always be pointer mode
  const [markerColor, setMarkerColor] = useState("black");
  const [markerLineWidth, setMarkerLineWidth] = useState(5);

  useEffect(() => {
    const cleanupWebSocket = WhiteboardConnection({
      roomID: roomId ?? "",
      onReceived: (action: WhiteboardAction) => {
        console.log("Received WhiteboardAction:", action);
        if (!isHost) {
          if (action.TYPE.endsWith("_start") && action.X && action.Y && action.COLOR) {
            setMarkerColor(action.COLOR);
            startDrawOnCanvas(action.X, action.Y);
          } else if ((action.TYPE === "draw" || action.TYPE == "erase") && action.X && action.Y) {
            drawingOnCanvas(action.X, action.Y);
          } else if (action.TYPE.endsWith("_stop") && action.X && action.Y) {
            stopDrawOnCanvas();
          } else if (action.TYPE === "change_marker_color" && action.COLOR) {
            setMarkerColor(action.COLOR);
          } else if (action.TYPE === "change_marker_line_width" && action.LINE_WIDTH) {
            setMarkerLineWidth(action.LINE_WIDTH);
          } else if (action.TYPE === "clear_canvas") {
            if (canvasRef.current) {
              contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      },
    });
    return cleanupWebSocket;
  }, [roomId]);

  // setup for all users
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext("2d");
        if (context) {
            context.scale(2, 2);
            context.lineCap = "round";
            context.strokeStyle = markerColor;
            context.lineWidth = markerLineWidth;
            contextRef.current = context;
        }
    }
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    if (markerColor) context.strokeStyle = markerColor;
    if (markerLineWidth) context.lineWidth = markerLineWidth;

  }, [markerColor, markerLineWidth]);

  // canvas functions
  const startDrawOnCanvas = (x: number, y: number) => {
    if (cursorMode == "eraser") contextRef.current.strokeStyle = "white";
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  }

  const drawingOnCanvas = (x: number, y: number) => {
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  }

  const stopDrawOnCanvas = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  }

  // host actions
  const hostStartDrawing = ({ nativeEvent }: any) => {
    if (!isHost || isDrawing || cursorMode == "pointer") return;
    const { offsetX, offsetY } = nativeEvent;
    startDrawOnCanvas(offsetX, offsetY);
    sendWhiteboardAction({
      SESSION_ID: roomId,
      TYPE: cursorMode == "pen" ? "draw_start" : "erase_start",
      COLOR: cursorMode == "pen" ? markerColor : "white",
      X: offsetX, 
      Y: offsetY
    })
  };

  const hostDrawing = ({ nativeEvent }: any) => {
    if (!isHost || !isDrawing || cursorMode == "pointer") return;
    const { offsetX, offsetY } = nativeEvent;
    drawingOnCanvas(offsetX, offsetY);
    sendWhiteboardAction({
      SESSION_ID: roomId ?? "",
      TYPE: cursorMode == "pen" ? "draw" : "erase",
      X: offsetX, 
      Y: offsetY
    });
  };

  const hostStopDrawing = () => {
    if (!isHost || cursorMode == "pointer") return;
    stopDrawOnCanvas();
    sendWhiteboardAction({
      SESSION_ID: roomId ?? "",
      TYPE: cursorMode == "pen" ? "draw_stop" : "erase_stop"
    });
  };

  const hostChangeMarkerColor = (color: string) => {
    if (!isHost || color === markerColor) return;
    setMarkerColor(color);
    sendWhiteboardAction({
      SESSION_ID: roomId ?? "",
      TYPE: "change_marker_color",
      COLOR: color
    });
  }

  const hostChangeMarkerLineWidth = (lineWidth: number) => {
    if (!isHost || lineWidth === markerLineWidth) return;
      setMarkerLineWidth(lineWidth);
      sendWhiteboardAction({
        SESSION_ID: roomId ?? "",
        TYPE: "change_marker_line_width",
        LINE_WIDTH: lineWidth
      });
  }

  const togglePointerAndPenMode = () => {
    contextRef.current.strokeStyle = markerColor;
    setCursorMode(cursorMode == "pen" ? "pointer" : "pen");
  }
  
  const clearCanvas = () => {
    if (canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      sendWhiteboardAction({
        SESSION_ID: roomId ?? "",
        TYPE: "clear_canvas"
      });
    }
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={hostStartDrawing}
        onMouseMove={hostDrawing}
        onMouseUp={hostStopDrawing}
        onMouseLeave={hostStopDrawing}
        className={`${cursorMode}-cursor`}
        style={{ border: "1px solid black", background: "white"}}
      />
      {isHost &&
         <div className="absolute bottom-8 flex justify-center space-x-2">
         {/* TOGGLE FOR MARKER AND POINTER MODE */}
         <Button
           variant="secondary"
           size="sm"
           className="bg-gray-800 text-white"
           onClick={() => togglePointerAndPenMode()}
         >
          {cursorMode != "pen" ?
            <Pen className="h-4 w-4"/> :
            <MousePointer2 className="h-4 w-4" />
          }
         </Button>
        
        {/* POPOVER FOR MARKER COLOR SETTINGS */}
         <Popover>
          <PopoverContent side="top" align="center">
            <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center gap-2">
              <Label htmlFor="background-color">Marker Color</Label>
              {markerColors.map((color, index) => (
                <div
                  key={`color-${index}`}
                  className="w-16 h-6 p-1 marker-color" 
                  style={{backgroundColor: `${color}`}}
                  onClick={() => hostChangeMarkerColor(color)}>
                </div>
              ))}
              <Input
                type="color"
                id="background-color"
                value={markerColor}
                onChange={(e) => hostChangeMarkerColor(e.target.value)}
                className="w-16 h-8 p-1"
              />
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <Button
            variant="secondary"
            size="sm"
            className="bg-gray-800 text-white gap-4"
          >
             <p>Color:</p>
             <Input
                type="color"
                id="background-color"
                value={markerColor}
                style={{pointerEvents: "none"}}
                className="w-16 h-8 p-1"
              />
            </Button>
          
          </PopoverTrigger>
         </Popover>

        {/* POPOVER FOR MARKER LINE WIDTH SETTINGS */}
        <Popover>
          <PopoverContent side="top" align="center">
            <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center gap-2">
              <Label htmlFor="line-width">Line Width</Label>
                {lineWidths.map((width, index) => (
                  <div
                    key={`line-width-${index}`}
                    className={`w-28 h-8 p-1 border-${width}px`}
                    onClick={() => hostChangeMarkerLineWidth(width)}
                  >
                  </div>
                ))}
                <Input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={markerLineWidth}
                  onChange={(e) => hostChangeMarkerLineWidth(Number(e.target.value))}
                  className="flex-1 w-28 h-8 p-1"
                />
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <Button
              variant="secondary"
              size="sm"
              className="bg-gray-800 text-white flex items-center justify-center gap-4"
            >
             <p>Line Width:</p>
             <div
                key={`line-width-selected`}
                className={`w-14 border-${markerLineWidth}px`}
             >
             </div>
            </Button>
          </PopoverTrigger>
        </Popover>

         {/* BUTTON TO CHANGE TO ERASER MODE */}
         <Button
          variant="secondary"
          size="sm"
          className="bg-gray-800 text-white"
          onClick={() =>  setCursorMode("eraser")}
        >
            <Eraser className="h-4 w-4"/>
        </Button>
           
        {/* POPOVER TO CONFIRM CLEAR CANVAS */}
         <Popover>
          <PopoverContent side="top" align="center">
            <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center gap-2">
              <p>Confirm clear canvas?</p>
              <div className="flex gap-2 mt-2">
              <PopoverClose>
                <Button
                  variant="secondary"
                  className="bg-gray-800 text-white"
                  size="sm"
                  onClick={() => clearCanvas()}
                >
                  Yes
                </Button>
              </PopoverClose>
                <PopoverClose>
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white"
                    size="sm"
                  >
                    No
                  </Button>
                </PopoverClose>
              </div>
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <Button
            variant="secondary"
            className="bg-gray-800 text-white"
            size="sm"
          >
            Clear Canvas
          </Button>
          
          </PopoverTrigger>
         </Popover>

         
       </div>
      }
    </div>
  );
};

export default Whiteboard;
