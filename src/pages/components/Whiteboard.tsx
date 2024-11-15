import { useRef, useState, useEffect } from "react";

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
    sendDrawAction?: (x: number, y: number, color: string, lineWidth: number) => void;
    stopDrawAction?: () => void;
}
const Whiteboard: React.FC<WhiteboardProps> = ({ isHost, data, sendDrawAction , stopDrawAction}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
            context.strokeStyle = "black";
            context.lineWidth = 5;
            contextRef.current = context;
        }
    }
    
  }, []);

  useEffect(() => {
    // set context
    if (data?.type == "draw") {
      const context = contextRef.current;
      if (!isDrawing) {
        setIsDrawing(true);
        context.moveTo(data.x, data.y);
      }
      context.strokeStyle = data.color;
      context.lineWidth = data.lineWidth;
      context.lineTo(data.x, data.y);
      context.stroke();
    }

    if (data?.type == "draw_stop") {
      setIsDrawing(false);
    }
   
  }, [data]);

  const startDrawing = ({ nativeEvent }: any) => {
    if (!isHost) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: any) => {
    if (!isDrawing || !isHost) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    console.log(offsetX, offsetY, "to send");
    // can send the websocket signal
    if (sendDrawAction) {
      sendDrawAction(offsetX, offsetY, "black", 5);
    }
  };

  const stopDrawing = () => {
    if (!isHost) return;

    contextRef.current.closePath();
    setIsDrawing(false);
    if (stopDrawAction) {
      stopDrawAction();
    }
  };

  return (
    <div className="w-full h-full max-w-auto max-h-auto flex justify-center items-center">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: "1px solid black", background: "white" }}
      />
    </div>
  );
};

export default Whiteboard;
