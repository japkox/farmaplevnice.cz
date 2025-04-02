import { useState, useEffect, FormEvent } from 'react';
import { X, Plus, Edit, Trash2, ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  order: number;
}

type EditableGalleryImage = Partial<GalleryImage> & {
  newImage?: File
}

export default function Gallery() {
  const { user, supabase } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<Partial<GalleryImage> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        setIsAdmin(!!data?.is_admin);
      } catch (err) {
        console.error('Chyba při kontrole statusu:', err);
      }
    }

    checkAdminStatus();
  }, [user, supabase]);

  useEffect(() => {
    async function loadImages() {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('order');

        if (error) throw error;
        setImages(data || []);
      } catch (err) {
        console.error('Nepodařilo se načíst galerii:', err);
        toast.error('Nepodařilo se načíst galerii');
      } finally {
        setIsLoading(false);
      }
    }

    loadImages();
  }, [supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Chyba při nahrávání fotky:', err);
      toast.error('Chyba při nahrávání fotky');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      type EditableImage = Partial<GalleryImage> & {
        newImage?: File
      }
      
      const editableImage = editingImage as EditableGalleryImage
      const imageData = { ...editableImage }
      
      if (editableImage.newImage instanceof File) {
        const imageUrl = await handleImageUpload(editableImage.newImage)
        if (imageUrl) {
          imageData.image_url = imageUrl
        }
      }
      

      delete (imageData as any).newImage;

      const { error } = await supabase
        .from('gallery_images')
        .upsert({
          id: imageData.id,
          title: imageData.title,
          description: imageData.description,
          image_url: imageData.image_url,
          order: imageData.order || images.length + 1,
        });

      if (error) throw error;

      const { data: updatedImages, error: fetchError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order');

      if (fetchError) throw fetchError;
      setImages(updatedImages || []);

      toast.success(imageData.id ? 'Fotka aktualizována' : 'Fotka nahrána');
      setIsEditModalOpen(false);
      setEditingImage(null);
    } catch (err) {
      console.error('Error saving image:', err);
      toast.error('Failed to save image');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Fotka smazána');
    } catch (err) {
      console.error('Chyba při mazání fotky:', err);
      toast.error('Chyba při mazání fotky');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  const editableImage = editingImage as EditableGalleryImage;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader
          title="Naše galerie"
          description=""
          actions={
            isAdmin && (
              <Button
                onClick={() => {
                  setEditingImage({
                    title: '',
                    description: '',
                    image_url: '',
                  });
                  setIsEditModalOpen(true);
                }}
                icon={<Plus className="h-5 w-5" />}
              >
                Přidat fotku
              </Button>
            )
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map(image => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg shadow-md aspect-[4/3] bg-white cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300" />
              <div className="absolute inset-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                <p className="text-sm">{image.description}</p>
              </div>
              {isAdmin && (
                <div 
                  className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingImage(image);
                      setIsEditModalOpen(true);
                    }}
                    icon={<Edit className="h-5 w-5" />}
                    className="!bg-white !text-gray-800"
                  />
                  <Button
                    variant="danger"
                    onClick={() => deleteImage(image.id)}
                    icon={<Trash2 className="h-5 w-5" />}
                    className="!bg-white !text-gray-800"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative flex flex-col bg-white rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                onClick={() => setSelectedImage(null)}
                icon={<X className="h-6 w-6" />}
                className="absolute top-2 right-2 z-10"
              />
              
              <div className="h-[calc(90vh-120px)] w-[90vw] max-w-7xl flex items-center justify-center">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="p-6 bg-white border-t">
                <h3 className="text-2xl font-semibold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingImage(null);
          }}
          title={editingImage?.id ? 'Úprava fotky' : 'Přidání fotky'}
        >
          <form onSubmit={handleImageSubmit} className="space-y-6">
            <Input
              label="Název"
              required
              value={editingImage?.title}
              onChange={(e) => setEditingImage(prev => prev ? { ...prev, title: e.target.value } : null)}
            />

            <Input
              label="Popis"
              as="textarea"
              rows={3}
              value={editingImage?.description}
              onChange={(e) => setEditingImage(prev => prev ? { ...prev, description: e.target.value } : null)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotka
              </label>
              <div className="relative w-32 h-32 mb-2">
                <img
                  src={editingImage?.image_url || ''}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {!editableImage?.image_url && !editableImage?.newImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditingImage(prev => prev ? { ...prev, newImage: file } : null);
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingImage(null);
                }}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                loading={uploadingImage}
              >
                {editingImage?.id ? 'Aktualizovat' : 'Přidat'}
              </Button>
            </div>
          </form>
        </Modal>
      </Container>
    </div>
  );
}