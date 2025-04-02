import { useState, FormEvent } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { supabase } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      try {
        await fetch('/api/send-new-message-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: formData.email,
            subject: formData.subject,
            content: formData.message
          })
        });
      } catch(e) {  }

      toast.success('Zpráva byla odeslána!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Chyba při odesílání zprávy:', err);
      toast.error('Chyba při odesílání zprávy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader
          title="Kontaktujte nás"
          description="Pokud máte jakékoli dotazy nebo potřebujete další informace, neváhejte nás kontaktovat."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <Card.Body>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Naše adresa</h3>
                  <p className="text-gray-600">
                    Plevnice 4<br />
                    393 01 Pelhřimov<br />
                    Česká republika
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Telefon</h3>
                  <p className="text-gray-600">
                    <a href="tel:+420565442526" className="hover:text-green-600">
                      +420 731 460 298
                    </a>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@farmaplevnice.cz" className="hover:text-green-600">
                      farmaplevnice@seznam.cz
                    </a>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <Card.Body>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pošlete nám zprávu</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Vaše jméno"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />

                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />

                  <Input
                    label="Předmět"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />

                  <Input
                    label="Zpráva"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    as="textarea"
                  />

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    icon={<Send className="h-5 w-5" />}
                    className="w-full"
                  >
                    Odeslat zprávu
                  </Button>
                </form>
              </Card.Body>
            </Card>
          </div>

          <div>
            <Card>
              <Card.Body className="h-[600px] p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1542.6655298863477!2d15.290236408798053!3d49.43832799049444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470ce38c6e240915%3A0xbcb4378ff9096596!2zUGxldm5pY2UgNCwgMzkzIDAxIE9sZcWhbsOhLVBlbGjFmWltb3YsIMSMZXNrbw!5e0!3m2!1scs!2sat!4v1743526464858!5m2!1scs!2sat"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}