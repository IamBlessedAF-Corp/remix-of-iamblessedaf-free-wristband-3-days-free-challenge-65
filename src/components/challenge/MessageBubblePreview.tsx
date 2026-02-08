interface MessageBubblePreviewProps {
  message: string;
}

const MessageBubblePreview = ({ message }: MessageBubblePreviewProps) => {
  return (
    <div className="mx-auto max-w-xs">
      <p className="text-xs text-center text-muted-foreground mb-2 font-medium">
        📱 Preview — How your friend will see it
      </p>
      <div className="bg-muted/50 rounded-[24px] p-4 border border-border/50 shadow-sm">
        {/* Status bar mock */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[10px] text-muted-foreground font-medium">11:11</span>
          <span className="text-[10px] text-muted-foreground">●●●●</span>
        </div>
        {/* Time stamp */}
        <p className="text-[10px] text-muted-foreground text-center mb-3">
          Today 11:11 AM
        </p>
        {/* Message bubble — incoming style (gray, left-aligned) */}
        <div className="flex justify-start">
          <div className="bg-secondary text-foreground rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%] text-sm whitespace-pre-line leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubblePreview;
