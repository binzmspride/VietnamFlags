import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "@/components/drawing-canvas";
import { DrawingTools } from "@/components/drawing-tools";
import { FlagGallery } from "@/components/flag-gallery";
import { Flag, Plus, Save, Images, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [showGallery, setShowGallery] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Flag className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-slate-900">FlagDraw Studio</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 ml-8">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Flag
              </Button>
              <Button variant="secondary">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-slate-600">Welcome,</span>
              <span className="font-medium text-slate-900">{user?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGallery(!showGallery)}
              >
                <Images className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Drawing Tools Sidebar */}
        <DrawingTools
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          opacity={opacity}
          setOpacity={setOpacity}
        />

        {/* Main Canvas Area */}
        <div className="flex-1">
          <DrawingCanvas
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            opacity={opacity}
          />
        </div>

        {/* User Gallery Sidebar */}
        {showGallery && (
          <FlagGallery onClose={() => setShowGallery(false)} />
        )}
      </div>
    </div>
  );
}
