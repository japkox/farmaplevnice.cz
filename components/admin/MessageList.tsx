import { useState } from 'react';
import { Mail, Search, Check, X, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMarkAsRead: (messageId: string, read: boolean) => void;
  onDelete: (messageId: string) => void;
}

export function MessageList({
  messages,
  searchQuery,
  onSearchChange,
  onMarkAsRead,
  onDelete
}: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (messages.length === 0 && !searchQuery) {
    return (
      <EmptyState
        icon={Mail}
        title="Zatím žádné zprávy"
        description="Žádné zprávy nebyly nalezeny."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Body>
          <Input
            placeholder="Hledat ve zprávách.."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </Card.Body>
      </Card>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <Card.Body>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{message.subject}</h3>
                    {!message.read && (
                      <Badge variant="warning">Nepřečteno</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Od: {message.name} ({message.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    Vytvořeno: {formatDate(message.created_at)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onMarkAsRead(message.id, !message.read)}
                    icon={message.read ? <Mail className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                  >
                    {message.read ? 'Označit jako nepřečteno' : 'Označit jako přečteno'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <Eye className="h-5 w-5"/>
                    Zobrazit
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Detail zprávy"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Od</h3>
              <p className="mt-1">
                {selectedMessage.name} ({selectedMessage.email})
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Předmět</h3>
              <p className="mt-1">{selectedMessage.subject}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Zpráva</h3>
              <p className="mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Vytvořeno</h3>
              <p className="mt-1">{formatDate(selectedMessage.created_at)}</p>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedMessage(null)}
              >
                Zavřít
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Opravdu chcete smazat tuto zprávu?')) {
                    onDelete(selectedMessage.id);
                    setSelectedMessage(null);
                  }
                }}
                icon={<X className="h-5 w-5" />}
              >
                Smazat
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}