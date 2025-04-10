import { useState } from 'react';
import { Search, Trash2, Save, X, Shield, ShieldOff, FilePen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../lib/types';

interface UserListProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
}

export function UserList({ users, searchQuery, onSearchChange, onToggleAdmin }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveAdminConfirm, setShowRemoveAdminConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { user, supabase } = useAuth();

  const loadUserDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedUser(data);
      }
    } catch (err) {
      console.error('Chyba při načítání dat:', err);
      toast.error('Chyba při načítání dat');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          phone: editingUser.phone,
          address: editingUser.address,
          city: editingUser.city,
          state: editingUser.state,
          zip_code: editingUser.zip_code,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      await loadUserDetails(editingUser.id);
      
      users = users.map(u => u.id === editingUser.id ? {
        ...u,
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email
      } : u);
      
      setEditingUser(null);
      toast.success('Uživatel byl aktualizován');
    } catch (err) {
      console.error('Chyba při aktualizaci uživatele:', err);
      toast.error('Chyba při aktualizaci uživatele');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success('Účet byl smazán');
      setShowDeleteConfirm(false);
      setSelectedUser(null);

      users = users.filter(u => u.id !== selectedUser.id);
    } catch (err) {
      console.error('Chyba při mazání účtu:', err);
      toast.error('Chyba při mazání účtu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      onToggleAdmin(userId, true);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_admin: true });
      }
    } else {
      setShowRemoveAdminConfirm(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (users.length === 0 && !searchQuery) {
    return (
      <EmptyState
        icon={Search}
        title="Žádní uživatelé"
        description="Nebyli nalezeni žádní uživatelé."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Body>
          <Input
            placeholder="Hledejte uživatele podle jména nebo emailu"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <Card.Body>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-medium text-gray-600">
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Badge variant={user.is_admin ? 'success' : 'info'}>
                    {user.is_admin ? 'Admin' : 'Uživatel'}
                  </Badge>
                  <Button
                    variant="secondary"
                    onClick={() => loadUserDetails(user.id)}
                  >
                    <FilePen />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setEditingUser(null);
        }}
        title="Detail uživatele"
      >
        {isLoadingDetails ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
          </div>
        ) : selectedUser && (
          <div className="space-y-6">
            {editingUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Jméno"
                    value={editingUser.first_name || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      first_name: e.target.value
                    })}
                  />
                  <Input
                    label="Příjmení"
                    value={editingUser.last_name || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      last_name: e.target.value
                    })}
                  />
                </div>
                
                <Input
                  label="Email"
                  value={editingUser.email}
                  disabled
                />

                <Input
                  label="Telefon"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    phone: e.target.value
                  })}
                />

                <Input
                  label="Adresa"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    address: e.target.value
                  })}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Město"
                    value={editingUser.city || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      city: e.target.value
                    })}
                  />
                  <Input
                    label="Stát"
                    value={editingUser.state || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      state: e.target.value
                    })}
                  />
                  <Input
                    label="PSČ"
                    value={editingUser.zip_code || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      zip_code: e.target.value
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Jméno</p>
                  <p className="mt-1">
                    {selectedUser.first_name && selectedUser.last_name
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`
                      : 'Nenastaveno'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teleofn</p>
                  <p className="mt-1">{selectedUser.phone || 'Nenastaveno'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresa</p>
                  <p className="mt-1">{[selectedUser.address, selectedUser.city, selectedUser.state, selectedUser.zip_code].filter(item => item).join(', ') || 'Nenastaveno'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Účet vytvořen</p>
                  <p className="mt-1">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <Badge variant={selectedUser.is_admin ? 'success' : 'info'} className="mt-1">
                    {selectedUser.is_admin ? 'Admin' : 'Uživatel'}
                  </Badge>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-6">
              <div className="flex flex-col md:flex-row gap-2 justify-center md:justify-start">
                <Button
                  variant={selectedUser.is_admin ? 'danger' : 'primary'}
                  onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.is_admin)}
                  icon={selectedUser.is_admin ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  disabled={selectedUser.id === user.id}
                >
                  {selectedUser.is_admin ? 'Odebrat admina' : 'Povýšit'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  icon={<Trash2 className="h-5 w-5" />}
                >
                  Smazat účet
                </Button>
              </div>
              
              <div className="mt-4 flex flex-col md:flex-row gap-2 justify-center md:justify-start">
                {editingUser ? (
                  <>
                    <Button
                      onClick={handleSaveEdit}
                      icon={<Save className="h-5 w-5" />}
                    >
                      Uložit změny
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingUser(null)}
                      icon={<X className="h-5 w-5" />}
                    >
                      Zrušit
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditingUser(selectedUser)}
                    icon={<Save className="h-5 w-5" />}
                  >
                    Upravit detaily
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>
            Opravdu chcete smazat tento účet?
          </p>
          <div className="flex justify-end gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              loading={isLoading}
            >
              Smazat účet
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRemoveAdminConfirm}
        onClose={() => setShowRemoveAdminConfirm(false)}
        title="Odebrání admina"
      >
        <div className="space-y-4">
          <p>
            Opravdu chcete tomuto uživateli odebrat oprávnění?
          </p>
          <div className="flex justify-end gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowRemoveAdminConfirm(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedUser) {
                  onToggleAdmin(selectedUser.id, false);
                  setSelectedUser({ ...selectedUser, is_admin: false });
                  setShowRemoveAdminConfirm(false);
                }
              }}
            >
              Odebrat admina
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}