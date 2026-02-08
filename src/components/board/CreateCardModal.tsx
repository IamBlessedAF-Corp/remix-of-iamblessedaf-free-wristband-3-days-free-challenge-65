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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";
import StageSelector from "./StageSelector";
import DecisionMatrixInput from "./DecisionMatrixInput";
import { computeDelegationScore } from "@/utils/boardHelpers";

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
  const [stage, setStage] = useState("stage-1");
  const [scores, setScores] = useState({ vs_score: 0, cc_score: 0, hu_score: 0, r_score: 0, ad_score: 0 });

  if (selectedColumn !== columnId && columnId) {
    setSelectedColumn(columnId);
  }

  const delegationScore = computeDelegationScore(scores);

  const handleScoreChange = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

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
      stage,
      vs_score: scores.vs_score,
      cc_score: scores.cc_score,
      hu_score: scores.hu_score,
      r_score: scores.r_score,
      ad_score: scores.ad_score,
      delegation_score: delegationScore,
    });
    setTitle("");
    setDescription("");
    setMasterPrompt("");
    setPriority("medium");
    setStage("stage-1");
    setScores({ vs_score: 0, cc_score: 0, hu_score: 0, r_score: 0, ad_score: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
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

              <div className="grid grid-cols-3 gap-3">
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

                <StageSelector value={stage} onChange={setStage} />
              </div>

              <Separator />

              <DecisionMatrixInput
                scores={scores}
                delegationScore={delegationScore}
                onChange={handleScoreChange}
              />

              <Button onClick={handleCreate} className="w-full" disabled={!title.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Create Card
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardModal;
