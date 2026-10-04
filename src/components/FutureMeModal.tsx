import React, { useState } from 'react';
import { X, Mail, Send, Calendar, Check } from 'lucide-react';
import { translations } from '../i18n/translations';
import { FutureMeNote } from '../types';
import { getOffsetDateKey } from '../services/storage';

interface FutureMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  notes: FutureMeNote[];
  onCreateNote: (note: FutureMeNote) => void;
}

export const FutureMeModal: React.FC<FutureMeModalProps> = ({
  isOpen,
  onClose,
  language,
  notes,
  onCreateNote,
}) => {
  const t = translations[language].futureMe;
  const [content, setContent] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'tomorrow' | 'next_week' | 'next_month'>('tomorrow');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let targetDate = getOffsetDateKey(1);
    if (deliveryOption === 'next_week') targetDate = getOffsetDateKey(7);
    else if (deliveryOption === 'next_month') targetDate = getOffsetDateKey(30);

    const newNote: FutureMeNote = {
      id: `note_${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      deliverOn: targetDate,
      isRead: false,
    };

    onCreateNote(newNote);
    setContent('');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2421]/30 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD8CE] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#37523F]" />
            <h2 className="text-sm font-semibold text-[#1F2421]">{t.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78817B] hover:text-[#1F2421] transition-colors rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-2 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-[#EBF1ED] text-[#2D4A36] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs font-medium text-[#284433]">{t.savedNotice}</p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs text-[#5E6460] mb-2 font-medium">
                  {t.composePlaceholder}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g. Remember why you started. Drink some water and take things one breath at a time."
                  rows={4}
                  required
                  className="w-full p-3 text-sm bg-white border border-[#DDD8CE] rounded-xl text-[#1F2421] placeholder-[#9CA39E] focus:outline-none focus:border-[#2D4A36] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5E6460] mb-1.5 font-medium">
                  {t.deliverWhen}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('tomorrow')}
                    className={`py-2 px-3 text-xs rounded-xl border transition-colors cursor-pointer text-center ${
                      deliveryOption === 'tomorrow'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36] font-medium'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    {t.deliverTomorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('next_week')}
                    className={`py-2 px-3 text-xs rounded-xl border transition-colors cursor-pointer text-center ${
                      deliveryOption === 'next_week'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36] font-medium'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    {t.deliverNextWeek}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('next_month')}
                    className={`py-2 px-3 text-xs rounded-xl border transition-colors cursor-pointer text-center ${
                      deliveryOption === 'next_month'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36] font-medium'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    {t.deliverNextMonth}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs text-[#5E6460] hover:text-[#1F2421] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Seal Note</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
