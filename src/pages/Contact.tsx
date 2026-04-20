import { useState } from 'react';
import { Phone, Mail, MessageSquare, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('contact_messages').insert(form);
    setSubmitting(false);
    if (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } else {
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-52 sm:h-64 md:h-72">
        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Contact"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-6">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <span className="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Informatiecentrum</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Contact</h1>
            <p className="text-white/70 text-sm mt-1">Welkom bij het Informatiecentrum</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 pt-8 pb-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
              Heb je vragen over onze opleidingen of hulp nodig bij je aanmelding? Bij het Informatiecentrum helpen we je verder!
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Een opleiding kiezen kan lastig zijn. Dat begrijpen wij heel goed. Heb je vragen over een van onze opleidingen? Of heb je hulp nodig bij je aanmelding? Dan is het Informatiecentrum van het ROC van Flevoland de plek waar je moet zijn.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-5">Zo kun je ons bereiken</h3>

            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  label: 'TELEFOON',
                  value: '0900 - 0918',
                  href: 'tel:09000918',
                },
                {
                  icon: Mail,
                  label: 'E-MAIL',
                  value: 'informatiecentrum@rocvf.nl',
                  href: 'mailto:informatiecentrum@rocvf.nl',
                },
                {
                  icon: MessageSquare,
                  label: 'WHATSAPP',
                  value: '06 - 250 385 66',
                  href: 'https://wa.me/31625038566',
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-roc-50 transition-colors">
                    <Icon size={18} className="text-gray-500 group-hover:text-roc-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-0.5">{label}</p>
                    <p className="text-base font-semibold text-gray-900">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Afspraak met studiekeuze-adviseur maken?</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Vind je het lastig om een opleiding te kiezen? Of twijfel je welke opleiding beter bij jou past? Een persoonlijk gesprek met een studiekeuze-adviseur kan dan helpen. Samen kijken jullie welke opleidingen passen bij jouw talenten en interesses.
              </p>
              <a
                href="mailto:informatiecentrum@rocvf.nl"
                className="inline-flex items-center gap-2 mt-5 text-roc-500 font-semibold text-sm hover:gap-3 transition-all"
              >
                Maak een afspraak <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Stuur ons een bericht</h2>

            {submitted ? (
              <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                <CheckCircle size={22} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 mb-1">Bericht verstuurd!</p>
                  <p className="text-sm text-green-700">We nemen zo snel mogelijk contact met je op.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
                )}

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Naam <span className="text-roc-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Voornaam"
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      E-mailadres <span className="text-roc-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="E-mailadres"
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Onderwerp <span className="text-roc-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Onderwerp"
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Bericht <span className="text-roc-500">*</span>
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      placeholder="Noem hier ook de naam van de opleiding waarover je een vraag hebt."
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2.5 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors disabled:opacity-60 text-sm"
                >
                  {submitting ? 'Verzenden…' : 'Verzenden'}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
