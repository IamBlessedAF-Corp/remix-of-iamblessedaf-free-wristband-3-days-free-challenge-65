import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";

interface CreateCardModalProps {
  open: boolean;
  columnId: string;
  columns: BoardColumn[];
  onClose: () => void;
  onCreate: (card: Partial<BoardCard>) => void;
}

const CreateCardModal = ({ open, columnId, columns, onClose, onCreate }: CreateCardModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [masterPrompt, setMasterPrompt] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedColumn, setSelectedColumn] = useState(columnId);

  // Reset when columnId changes
  if (selectedColumn !== columnId && columnId) {
    setSelectedColumn(columnId);
  }

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description || null,
      master_prompt: masterPrompt || null,
      priority,
      column_id: selectedColumn || columnId,
      position: 0,
      staging_status: "staging",
      labels: [],
    });
    setTitle("");
    setDescription("");
    setMasterPrompt("");
    setPriority("medium");
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Master Prompt</Label>
            <Textarea
              value={masterPrompt}
              onChange={(e) => setMasterPrompt(e.target.value)}
              rows={5}
              placeholder="Detailed task instructions..."
              className="mt-1 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🔵 Medium</SelectItem>
                  <SelectItem value="low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Column</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full" disabled={!title.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Create Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardModal;
