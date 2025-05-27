import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Download, Grid3X3 } from "lucide-react";

interface DrawingCanvasProps {
  currentTool: string;
  currentColor: string;
  brushSize: number;
  opacity: number;
}

export function DrawingCanvas({ 
  currentTool, 
  currentColor, 
  brushSize, 
  opacity 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [zoom, setZoom] = useState(100);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setContext(ctx);

    // Set default canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity / 100;

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = currentColor;
      context.fillStyle = currentColor;
      context.lineWidth = brushSize;
      context.globalAlpha = opacity / 100;
    }
  }, [context, currentColor, brushSize, opacity]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;

    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCoordinates(coords);

    if (currentTool === 'brush') {
      context.beginPath();
      context.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const coords = getCoordinates(e);
    setCoordinates(coords);

    if (currentTool === 'brush') {
      context.lineTo(coords.x, coords.y);
      context.stroke();
    } else if (currentTool === 'eraser') {
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(coords.x, coords.y, brushSize / 2, 0, 2 * Math.PI);
      context.fill();
      context.restore();
    }
  };

  const stopDrawing = () => {
    if (!context) return;

    setIsDrawing(false);
    if (currentTool === 'brush') {
      context.beginPath();
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 25));
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-flag.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    if (!context) return;
    
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 800, 600);
  };

  return (
    <div className="flex-1 bg-slate-100 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Canvas Header */}
        <Card className="mb-0 rounded-b-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-slate-900">Untitled Flag</h2>
              <span className="text-sm text-slate-500">Canvas: 800x600px</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 min-w-[50px] text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-slate-300 mx-2"></div>
              <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button onClick={handleExport} size="sm" className="bg-accent hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Canvas Container */}
        <Card className="rounded-t-none">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div 
                className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                style={{ width: '800px', height: '600px' }}
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className={`block border border-slate-300 touch-none ${
                    currentTool === 'brush' ? 'cursor-crosshair' : 
                    currentTool === 'eraser' ? 'cursor-crosshair' : 'cursor-pointer'
                  }`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                />
                
                {/* Canvas Overlay for UI elements */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <span>X: {Math.round(coordinates.x)}, Y: {Math.round(coordinates.y)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Click and drag to draw • Use tools from the sidebar • Save your progress regularly</p>
        </div>
      </div>
    </div>
  );
}
