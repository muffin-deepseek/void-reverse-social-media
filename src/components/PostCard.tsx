import { useState, useRef } from 'react';
import { Trash2, Clock, Users } from 'lucide-react';

interface PostCardProps {
  id: string;
  type: 'image' | 'quote' | 'meme';
  content: string;
  imageUrl?: string;
  author?: string;
  timestamp: Date;
  survivedTime: number;
  deletedBy?: number;
  onDelete: (id: string) => void;
}

const PostCard = ({ 
  id, 
  type, 
  content, 
  imageUrl, 
  timestamp, 
  survivedTime, 
  deletedBy = 0,
  onDelete 
}: PostCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Trigger deletion animation
    if (cardRef.current) {
      cardRef.current.classList.add('delete-slide');
    }
    
    // Wait for animation to complete
    setTimeout(() => {
      onDelete(id);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = startX.current - currentX;
    
    if (diffX > 100) { // Swipe threshold
      handleDelete();
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const formatSurvivalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={cardRef}
      className={`bg-card border border-terminal-border p-4 mb-4 transition-all duration-200 hover:border-neon-dim ${
        isDeleting ? 'delete-slide' : 'animate-fade-in-up'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-neon-primary text-xs font-mono">
            POST_{id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-text-muted text-xs">
            [{type.toUpperCase()}]
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="group p-2 hover:bg-destructive/20 border border-destructive/50 transition-all duration-200 hover:border-destructive"
        >
          <Trash2 className="w-4 h-4 text-destructive group-hover:animate-pulse" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        {imageUrl && (
          <div className="mb-3">
            <img 
              src={imageUrl} 
              alt={`Post ${id}`}
              className="w-full max-w-md mx-auto border border-neon-dim/30 block"
            />
          </div>
        )}
        
        {content && (
          <div className="text-text-neon text-sm leading-relaxed">
            {type === 'quote' ? (
              <blockquote className="italic border-l-2 border-neon-primary pl-3">
                "{content}"
              </blockquote>
            ) : (
              <p className="font-mono">{content}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex justify-between items-center text-xs text-text-muted border-t border-terminal-border pt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>SURVIVED: {formatSurvivalTime(survivedTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>DELETED_BY: {deletedBy}</span>
          </div>
        </div>
        
        <div className="text-neon-dim">
          CREATED: {timestamp.toLocaleTimeString()}
        </div>
      </div>

      {/* Deletion Instructions */}
      <div className="mt-2 text-xs text-text-muted/70 font-mono">
        TAP [X] OR SWIPE → TO DELETE
      </div>
    </div>
  );
};

export default PostCard;