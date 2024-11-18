import { Button } from "@/components/shadcn/ui/button";
import { useRef, useState, useEffect } from "react";
import { MousePointer2, Pen, Palette, Tally3, Eraser } from 'lucide-react';
import "@/index.css";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";

export type WhiteBoardData = {
  type: string;
  x?: number;
  y?: number;
  color?: string;
  lineWidth?: number;
}

interface WhiteboardProps {
    isHost: boolean;
    data?: WhiteBoardData;
    setData?: (data: WhiteBoardData) => void;
    sendActionForWhiteboard?: (data: WhiteBoardData) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ isHost, data, sendActionForWhiteboard}) => {
  const markerColors = ["black", "blue", "green", "red"];
  const lineWidths = [1, 3, 5, 10];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorMode, setCursorMode] = useState(isHost ? "pen" : "pointer"); //for viewers it will always be pointer mode
  const [markerColor, setMarkerColor] = useState("#000000");
  const [markerLineWidth, setMarkerLineWidth] = useState(5);

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

    if (data?.type == "draw" || data?.type == "erase") {
      if (!isDrawing) {
        setIsDrawing(true);
        context.beginPath();
        if (data.type == "erase") {
          context.strokeStyle = "white";
        } else {
          context.strokeStyle = data.color;
        }
        context.moveTo(data.x, data.y);
      }
      context.lineTo(data.x, data.y);
      context.stroke();
    }

    else if (data?.type == "draw_stop" || data?.type == "erase_stop") {
      setIsDrawing(false);
      context.closePath();
    }

    else if (data?.type == "change_marker_color" && data.color) {
      setMarkerColor(data.color);
      context.beginPath();
      context.strokeStyle = data.color;
    }

    else if (data?.type == "change_marker_line_width" && data.lineWidth) {
      setMarkerLineWidth(data.lineWidth);
      context.beginPath();
      context.lineWidth = data.lineWidth;
    }

    else if (data?.type == "clear_canvas" && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
   
  }, [data]);

  useEffect(() => {
    const context = contextRef.current;
    if (markerColor) context.strokeStyle = markerColor;
    if (markerLineWidth) context.lineWidth = markerLineWidth;

  }, [markerColor, markerLineWidth])

  const startDrawing = ({ nativeEvent }: any) => {
    if (!isHost || isDrawing || cursorMode == "pointer") return;
    const { offsetX, offsetY } = nativeEvent;
    if (cursorMode == "eraser") contextRef.current.strokeStyle = "white";
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: any) => {
    if (!isHost || !isDrawing || cursorMode == "pointer") return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    if (sendActionForWhiteboard) {
      sendActionForWhiteboard({
        type: cursorMode == "pen" ? "draw" : "erase",
        x: offsetX, 
        y: offsetY, 
        color: cursorMode == "pen" ? markerColor : "white", 
        lineWidth: markerLineWidth
      });
    }
  };

  const stopDrawing = () => {
    if (!isHost || cursorMode == "pointer") return;
    contextRef.current.closePath();
    setIsDrawing(false);

    if (sendActionForWhiteboard) {
      sendActionForWhiteboard({
        type: cursorMode == "pen" ? "draw_stop" : "erase_stop"
      });
    }
  };

  const changeMarkerColor = (color: string) => {
    if (color === markerColor) return;
    if (sendActionForWhiteboard) {
      setMarkerColor(color);
      sendActionForWhiteboard({
        type: "change_marker_color",
        color
      });
    }
  }

  const changeMarkerLineWidth = (lineWidth: number) => {
    if (lineWidth === markerLineWidth) return;
    if (sendActionForWhiteboard) {
      setMarkerLineWidth(lineWidth);
      sendActionForWhiteboard({
        type: "change_marker_line_width",
        lineWidth
      });
    }
  }

  const togglePointerAndPenMode = () => {
    contextRef.current.strokeStyle = markerColor;
    setCursorMode(cursorMode == "pen" ? "pointer" : "pen");
  }
  
  const clearCanvas = () => {
    if (canvasRef.current && sendActionForWhiteboard) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      sendActionForWhiteboard({type: "clear_canvas"})
    }
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
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
                  onClick={() => changeMarkerColor(color)}>
                </div>
              ))}
              <Input
                type="color"
                id="background-color"
                value={"#000000"}
                onChange={(e) => changeMarkerColor(e.target.value)}
                className="w-16 h-8 p-1"
              />
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <Button
            variant="secondary"
            size="sm"
            className="bg-gray-800 text-white"
          >
              <Palette className="h-4 w-4" />
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
                    onClick={() => changeMarkerLineWidth(width)}
                  >
                  </div>
                ))}
                <Input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={markerLineWidth}
                  onChange={(e) => changeMarkerLineWidth(Number(e.target.value))}
                  className="flex-1 w-28 h-8 p-1"
                />
            </div>
          </PopoverContent>
          <PopoverTrigger>
            <Button
              variant="secondary"
              size="sm"
              className="bg-gray-800 text-white"
            >
              <Tally3 className="h-4 w-4" />
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
            onClick={() => console.log("clear canvas")}
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
