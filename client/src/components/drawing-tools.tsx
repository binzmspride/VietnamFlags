import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Paintbrush, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  Eraser,
  Trash2,
  Undo,
  Redo 
} from "lucide-react";

interface DrawingToolsProps {
  currentTool: string;
  setCurrentTool: (tool: string) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

const tools = [
  { id: 'brush', icon: Paintbrush, label: 'Brush' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

const quickColors = [
  '#FF0000', '#FFFFFF', '#0000FF', '#008000', 
  '#FFFF00', '#000000', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#00FFFF'
];

const templates = [
  { id: 'horizontal-stripes', label: 'Horizontal Stripes' },
  { id: 'vertical-stripes', label: 'Vertical Stripes' },
  { id: 'blank', label: 'Blank Canvas' }
];

export function DrawingTools({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity
}: DrawingToolsProps) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 shadow-sm overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Tool Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Drawing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={currentTool === tool.id ? "default" : "outline"}
                    size="sm"
                    className="h-16 flex-col gap-1"
                    onClick={() => setCurrentTool(tool.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Brush Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Brush Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">
                Brush Size: {brushSize}px
              </Label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">
                Opacity: {opacity}%
              </Label>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">Primary Color</Label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">Quick Colors</Label>
              <div className="grid grid-cols-6 gap-2">
                {quickColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className="w-8 h-8 rounded-lg border-2 border-slate-300 hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flag Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="destructive" className="w-full" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Redo className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
