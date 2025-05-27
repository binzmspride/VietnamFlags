import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Copy, Trash2, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Flag as FlagType } from "@shared/schema";

interface FlagGalleryProps {
  onClose: () => void;
}

export function FlagGallery({ onClose }: FlagGalleryProps) {
  const { toast } = useToast();

  const { data: flags = [], isLoading } = useQuery<FlagType[]>({
    queryKey: ["/api/flags"],
  });

  const deleteFlagMutation = useMutation({
    mutationFn: async (flagId: number) => {
      await apiRequest("DELETE", `/api/flags/${flagId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flags"] });
      toast({
        title: "Success",
        description: "Flag deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete flag",
        variant: "destructive",
      });
    },
  });

  const duplicateFlagMutation = useMutation({
    mutationFn: async (flag: FlagType) => {
      const response = await apiRequest("POST", "/api/flags", {
        name: `${flag.name} (Copy)`,
        canvasData: flag.canvasData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flags"] });
      toast({
        title: "Success",
        description: "Flag duplicated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate flag",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (flagId: number) => {
    deleteFlagMutation.mutate(flagId);
  };

  const handleDuplicate = (flag: FlagType) => {
    duplicateFlagMutation.mutate(flag);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-sm overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">My Flags</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-video bg-slate-200 rounded mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Flag className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">No flags created yet</p>
            <p className="text-sm">Start designing your first flag!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => (
              <Card key={flag.id} className="hover:bg-slate-50 transition-colors duration-200">
                <CardContent className="p-4">
                  <div className="aspect-video bg-white rounded border-2 border-slate-200 mb-3 flex items-center justify-center overflow-hidden">
                    {flag.canvasData ? (
                      <img 
                        src={flag.canvasData} 
                        alt={flag.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Flag className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-medium text-slate-900 truncate">{flag.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Created {formatDate(flag.createdAt)}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(flag)}
                      disabled={duplicateFlagMutation.isPending}
                      className="text-primary hover:text-blue-700 text-sm p-0"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(flag.id)}
                      disabled={deleteFlagMutation.isPending}
                      className="text-red-600 hover:text-red-700 text-sm p-0"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
