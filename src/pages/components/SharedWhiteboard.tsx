import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Trash2, Download,Undo,Redo,PaintBucket,Users} from 'lucide-react';
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { sendModuleAction } from "@/utils/messaging-client";

interface DrawAction {
  type: 'start' | 'draw' | 'end';
  x: number;
  y: number;
  tool: string;
  color: string;
  lineWidth: number;
}

interface SharedWhiteboardProps {
  isHost: boolean;
  roomId: string;
  onDrawAction?: (action: DrawAction) => void;
  receivedAction?: DrawAction;
}

const SharedWhiteboard: React.FC<SharedWhiteboardProps> = ({ 
  isHost, 
  roomId, 
  onDrawAction,
  receivedAction 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
      saveToHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  }, []);

  useEffect(() => {
    if (receivedAction && context && canvasRef.current) {
      handleReceivedAction(receivedAction);
    }
  }, [receivedAction]);

  const handleReceivedAction = (action: DrawAction) => {
    if (!context || !canvasRef.current) return;

    context.strokeStyle = action.color;
    context.lineWidth = action.lineWidth;

    switch (action.type) {
      case 'start':
        context.beginPath();
        context.moveTo(action.x, action.y);
        break;
      case 'draw':
        context.lineTo(action.x, action.y);
        context.stroke();
        break;
      case 'end':
        context.closePath();
        saveToHistory(context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
        break;
    }
  };

  const saveToHistory = (imageData: ImageData) => {
    const newHistory = [...history.slice(0, historyIndex + 1), imageData];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const broadcastAction = (action: DrawAction) => {
    if (onDrawAction) {
      onDrawAction(action);
    }
    
    sendModuleAction({
      ID: "whiteboard",
      TYPE: "draw_action",
      SESSION_ID: roomId,
      SENDER: "host",
      TIMESTAMP: new Date().toISOString(),
      CONTENT: JSON.stringify(action)
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing(true);
    context.beginPath();
    context.moveTo(x, y);

    const action: DrawAction = {
      type: 'start',
      x,
      y,
      tool,
      color,
      lineWidth
    };
    broadcastAction(action);

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        context.font = `${lineWidth * 8}px Arial`;
        context.fillStyle = color;
        context.fillText(text, x, y);
        saveToHistory(context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !context || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = tool === 'eraser' ? lineWidth * 2 : lineWidth;

    if (tool === 'pencil' || tool === 'eraser') {
      context.lineTo(x, y);
      context.stroke();

      const action: DrawAction = {
        type: 'draw',
        x,
        y,
        tool,
        color: context.strokeStyle.toString(),
        lineWidth: context.lineWidth
      };
      broadcastAction(action);
    }
  };

  const stopDrawing = () => {
    if (!drawing || !context || !canvasRef.current) return;

    context.closePath();
    setDrawing(false);
    saveToHistory(context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));

    const action: DrawAction = {
      type: 'end',
      x: 0,
      y: 0,
      tool,
      color,
      lineWidth
    };
    broadcastAction(action);
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveToHistory(context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));

    sendModuleAction({
      ID: "whiteboard",
      TYPE: "clear_canvas",
      SESSION_ID: roomId,
      SENDER: "host",
      TIMESTAMP: new Date().toISOString()
    });
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const undo = () => {
    if (historyIndex > 0 && context && canvasRef.current) {
      setHistoryIndex(historyIndex - 1);
      context.putImageData(history[historyIndex - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && context && canvasRef.current) {
      setHistoryIndex(historyIndex + 1);
      context.putImageData(history[historyIndex + 1], 0, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 p-4">
      {isHost && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex space-x-2">
              <Button
                variant={tool === 'pencil' ? 'default' : 'outline'}
                onClick={() => setTool('pencil')}
                size="sm"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                onClick={() => setTool('eraser')}
                size="sm"
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'rectangle' ? 'default' : 'outline'}
                onClick={() => setTool('rectangle')}
                size="sm"
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'circle' ? 'default' : 'outline'}
                onClick={() => setTool('circle')}
                size="sm"
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'text' ? 'default' : 'outline'}
                onClick={() => setTool('text')}
                size="sm"
              >
                <Type className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="color">Color:</Label>
              <Input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-8"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="lineWidth">Width:</Label>
              <Input
                type="number"
                id="lineWidth"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-16"
                min="1"
                max="50"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={undo} disabled={historyIndex <= 0} size="sm">
                <Undo className="w-4 h-4" />
              </Button>
              <Button onClick={redo} disabled={historyIndex >= history.length - 1} size="sm">
                <Redo className="w-4 h-4" />
              </Button>
              <Button onClick={clearCanvas} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={downloadCanvas} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={isHost ? startDrawing : undefined}
          onMouseMove={isHost ? draw : undefined}
          onMouseUp={isHost ? stopDrawing : undefined}
          onMouseLeave={isHost ? stopDrawing : undefined}
        />
      </div>
    </div>
  );
};

export default SharedWhiteboard;