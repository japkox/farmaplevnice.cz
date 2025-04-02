import { useState, FormEvent } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Category } from '../../lib/types';
import { toast } from 'react-hot-toast';

interface CategoryListProps {
  categories: Category[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  editingCategory: Category | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function CategoryList({
  categories,
  newCategory,
  setNewCategory,
  editingCategory,
  onEdit,
  onDelete,
  onSubmit
}: CategoryListProps) {
  const [editValue, setEditValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleEditSave = (category: Category) => {
    if (!editValue.trim()) {
      toast.error('Název kategorie nemůže být prázdný');
      return;
    }
    onEdit({ ...category, name: editValue });
    setEditingId(null);
    setEditValue('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error('Název kategorie nemůže být prázdný');
      return;
    }
    onSubmit(e);
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (window.confirm(`Opravdu chcete smazat kategorii "${categoryName}"?`)) {
      onDelete(categoryId);
    }
  };

  return (
    <Card>
      <Card.Body>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-4">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Název kategorie"
              className="flex-1"
            />
            <Button type="submit">
              Přidat
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              {editingId === category.id ? (
                <div className="flex items-center w-full gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEditSave(category)}
                      icon={<Check className="h-5 w-5" />}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleEditCancel}
                      icon={<X className="h-5 w-5" />}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full gap-2">
                  <span className="text-lg truncate flex-1">{category.name}</span>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEditStart(category)}
                      icon={<Edit className="h-5 w-5" />}
                    />
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(category.id, category.name)}
                      icon={<Trash2 className="h-5 w-5" />}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}