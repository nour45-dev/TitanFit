'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Play,
  Pause,
  Image as ImageIcon,
  Smile,
  X,
  PhoneOff,
  Flame,
  ThumbsUp,
  Heart,
  Award,
} from 'lucide-react';
import {
  type ChatMessageItem,
  usePlatformStore,
} from '../lib/platform-store';
import {
  playWhatsAppSendSound,
  playWhatsAppReceiveSound,
  playVoiceWaveTone,
} from '../lib/audio-effects';

interface WhatsAppLiveChatProps {
  currentRole: 'MEMBER' | 'TRAINER';
  contactNameAr: string;
  contactNameEn: string;
  contactAvatar: string;
  contactSubtitleAr?: string;
  contactSubtitleEn?: string;
  contactPhone?: string;
  isAr: boolean;
  memberId?: string;
  trainerId?: string;
}

export function WhatsAppLiveChat({
  currentRole,
  contactNameAr,
  contactNameEn,
  contactAvatar,
  contactSubtitleAr,
  contactSubtitleEn,
  contactPhone,
  isAr,
  memberId,
  trainerId,
}: WhatsAppLiveChatProps) {
  const {
    chatMessages,
    sendChatMessage,
    toggleMessageReaction,
    isCoachTyping,
  } = usePlatformStore();

  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState(0);

  // Active Simulated WhatsApp Call State
  const [activeCallType, setActiveCallType] = useState<'AUDIO' | 'VIDEO' | null>(null);
  const [callDurationSec, setCallDurationSec] = useState(0);

  // Image Upload / Attachment State
  const [showImageAttachModal, setShowImageAttachModal] = useState(false);
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);
  const [attachmentCaption, setAttachmentCaption] = useState('');
  const [viewingFullImageUrl, setViewingFullImageUrl] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevMessagesCount = useRef(chatMessages.length);

  // Auto-scroll on new messages & play sound on incoming
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (chatMessages.length > prevMessagesCount.current) {
      const latestMsg = chatMessages[chatMessages.length - 1];
      if (latestMsg && latestMsg.senderRole !== currentRole) {
        playWhatsAppReceiveSound();
      }
    }
    prevMessagesCount.current = chatMessages.length;
  }, [chatMessages, currentRole]);

  // Voice recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Simulated Call Timer
  useEffect(() => {
    let callTimer: NodeJS.Timeout;
    if (activeCallType) {
      setCallDurationSec(0);
      callTimer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [activeCallType]);

  // Voice player progress simulation
  useEffect(() => {
    let anim: NodeJS.Timeout;
    if (playingVoiceId) {
      setVoicePlaybackProgress(0);
      const interval = 100;
      const totalMs = 6000;
      let elapsed = 0;
      anim = setInterval(() => {
        elapsed += interval;
        const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
        setVoicePlaybackProgress(pct);
        if (pct >= 100) {
          clearInterval(anim);
          setPlayingVoiceId(null);
          setVoicePlaybackProgress(0);
        }
      }, interval);
    }
    return () => clearInterval(anim);
  }, [playingVoiceId]);

  const handleSendTextMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    playWhatsAppSendSound();
    sendChatMessage(inputText.trim(), currentRole, {
      type: 'TEXT',
      memberId,
      trainerId,
    });
    setInputText('');
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(3, recordingSeconds);
    playWhatsAppSendSound();
    sendChatMessage(
      isAr ? `🎙️ رسالة صوتية (${duration} ثانية)` : `🎙️ Voice Note (${duration}s)`,
      currentRole,
      {
        type: 'VOICE',
        voiceDurationSec: duration,
        memberId,
        trainerId,
      },
    );
    setRecordingSeconds(0);
  };

  const handlePlayVoice = (msgId: string, durationSec: number = 4) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
      setVoicePlaybackProgress(0);
    } else {
      setPlayingVoiceId(msgId);
      playVoiceWaveTone(durationSec);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewAttachmentUrl(event.target?.result as string);
      setShowImageAttachModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSendAttachedImage = () => {
    if (!previewAttachmentUrl) return;
    playWhatsAppSendSound();
    sendChatMessage(
      attachmentCaption || (isAr ? '📷 صورة مرفقة' : '📷 Attached image'),
      currentRole,
      {
        type: 'IMAGE',
        mediaUrl: previewAttachmentUrl,
        memberId,
        trainerId,
      },
    );
    setShowImageAttachModal(false);
    setPreviewAttachmentUrl(null);
    setAttachmentCaption('');
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter messages for current member/trainer conversation
  const filteredChat = chatMessages.filter((msg) => {
    if (memberId && msg.memberId && msg.memberId !== memberId) return false;
    return true;
  });

  return (
    <div
      data-testid="whatsapp-live-chat-container"
      className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#EFEAE2] shadow-xl dark:border-slate-800 dark:bg-[#0B141A]"
    >
      {/* 1. WhatsApp Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 bg-[#075E54] px-4 py-3 text-white shadow-md dark:border-slate-800 dark:bg-[#202C33]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={contactAvatar}
              alt={isAr ? contactNameAr : contactNameEn}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-300/40"
            />
            <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#202C33]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">
                {isAr ? contactNameAr : contactNameEn}
              </h3>
              <span className="rounded bg-emerald-600/40 px-1.5 py-0.2 text-[10px] font-bold text-emerald-200">
                WhatsApp
              </span>
            </div>

            <p className="text-[11px] font-medium text-emerald-100/90 dark:text-emerald-400">
              {isCoachTyping ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300 [animation-delay:0.4s]" />
                  <span>{isAr ? 'يكتب الآن...' : 'typing...'}</span>
                </span>
              ) : (
                <span>
                  ● {isAr ? (contactSubtitleAr || 'متصل الآن') : (contactSubtitleEn || 'online')}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Call & Video Call simulation buttons */}
        <div className="flex items-center gap-1 text-emerald-100">
          <button
            type="button"
            title={isAr ? 'مكالمة صوتية واتساب' : 'Voice Call'}
            onClick={() => setActiveCallType('AUDIO')}
            className="rounded-full p-2 hover:bg-white/10 transition active:scale-95"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            type="button"
            title={isAr ? 'مكالمة فيديو واتساب' : 'Video Call'}
            onClick={() => setActiveCallType('VIDEO')}
            className="rounded-full p-2 hover:bg-white/10 transition active:scale-95"
          >
            <Video className="h-5 w-5" />
          </button>
          {contactPhone && (
            <a
              href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              title={isAr ? 'فتح في تطبيق واتساب' : 'Open in WhatsApp App'}
              className="rounded-full p-2 hover:bg-white/10 transition"
            >
              <MoreVertical className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Chat Messages Area (WhatsApp Wallpaper Background) */}
      <div
        className="flex-1 space-y-3 overflow-y-auto p-4"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(200, 200, 200, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="rounded-lg bg-slate-200/90 px-3 py-1 font-mono text-[11px] font-bold text-slate-700 shadow-sm dark:bg-[#182229] dark:text-slate-300">
            {isAr ? 'اليوم' : 'Today'}
          </span>
        </div>

        {/* Security / Encryption Badge */}
        <div className="mx-auto max-w-sm rounded-xl bg-amber-500/15 p-2 text-center text-[10px] font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-300 shadow-xs">
          🔒 {isAr
            ? 'الرسائل والمكالمات مشفرة تماماً بين المتدرب ومدربه المعتمد بنظام TitanFit Real-Time'
            : 'Messages are end-to-end encrypted between trainee and certified coach.'}
        </div>

        {filteredChat.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isAr
                ? 'لا توجد رسائل سابقة. ابدأ المحادثة المباشرة مع كابتنك الآن!'
                : 'No messages yet. Say hi to your personal coach!'}
            </p>
          </div>
        ) : (
          filteredChat.map((msg) => {
            const isOutgoing = msg.senderRole === currentRole;
            const isVoice = msg.type === 'VOICE';
            const isImage = msg.type === 'IMAGE';

            return (
              <div
                key={msg.id}
                className={`group flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm transition-all sm:max-w-[75%] ${
                    isOutgoing
                      ? 'bg-[#D9FDD3] text-slate-900 rounded-ee-none dark:bg-[#005C4B] dark:text-white'
                      : 'bg-white text-slate-900 rounded-es-none dark:bg-[#202C33] dark:text-slate-100'
                  }`}
                >
                  {/* Sender Name for incoming */}
                  {!isOutgoing && (
                    <span className="mb-1 block text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                      {isAr ? msg.senderNameAr : msg.senderNameEn}
                    </span>
                  )}

                  {/* 1. Voice Note Player */}
                  {isVoice ? (
                    <div className="flex items-center gap-3 py-1 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(msg.id, msg.voiceDurationSec)}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition shadow-sm ${
                          isOutgoing
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-slate-950'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ms-0.5" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio Waveform visualization */}
                        <div className="flex items-center gap-0.5 h-6">
                          {[40, 70, 30, 90, 60, 100, 50, 80, 40, 65, 95, 45, 75, 35, 85].map(
                            (h, idx) => {
                              const barPct = (idx / 15) * 100;
                              const isPlayed = playingVoiceId === msg.id && barPct <= voicePlaybackProgress;
                              return (
                                <div
                                  key={idx}
                                  style={{ height: `${h}%` }}
                                  className={`w-1 rounded-full transition-colors ${
                                    isPlayed
                                      ? 'bg-amber-500'
                                      : isOutgoing
                                      ? 'bg-slate-400 dark:bg-emerald-300/40'
                                      : 'bg-slate-300 dark:bg-slate-600'
                                  }`}
                                />
                              );
                            },
                          )}
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{formatSecs(msg.voiceDurationSec || 5)}</span>
                          <span>{playingVoiceId === msg.id ? '🔊 Play' : '🎙️ Voice'}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 2. Image Attachment */}
                  {isImage && msg.mediaUrl ? (
                    <div className="mb-2 overflow-hidden rounded-xl">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared media"
                        onClick={() => setViewingFullImageUrl(msg.mediaUrl || null)}
                        className="max-h-64 w-full cursor-pointer object-cover rounded-xl transition hover:opacity-95"
                      />
                    </div>
                  ) : null}

                  {/* 3. Text Message Content */}
                  {msg.textAr && !isVoice && (
                    <p className="leading-relaxed whitespace-pre-wrap font-medium">
                      {isAr ? msg.textAr : msg.textEn}
                    </p>
                  )}

                  {/* Time and WhatsApp Blue Ticks */}
                  <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-slate-500 dark:text-slate-300">
                    <span>{msg.time}</span>
                    {isOutgoing && (
                      <span className="inline-flex items-center">
                        {msg.status === 'READ' ? (
                          <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                        ) : msg.status === 'DELIVERED' ? (
                          <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Quick Reaction Pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="absolute -bottom-2.5 start-2 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 shadow-md ring-1 ring-slate-200 dark:bg-[#1F2C34] dark:ring-slate-700">
                      {msg.reactions.map((r, i) => (
                        <span key={i} className="text-xs">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floating Reaction Bar on Hover / Tap */}
                <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                  {['💪', '🔥', '👏', '❤️', '👍'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => toggleMessageReaction(msg.id, emoji)}
                      className="rounded-full bg-white/80 p-1 text-xs hover:scale-125 transition shadow-sm dark:bg-slate-800"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* 3. Quick Athletic & Nutrition Coaching Prompts */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-slate-300/80 bg-white/90 px-3 py-2 text-xs backdrop-blur-sm dark:border-slate-800 dark:bg-[#182229]">
        {[
          { ar: 'عايز أزود وزني في البنش ومحتاج نصيحة تكنيك', en: 'Tips to increase bench press?' },
          { ar: 'إيه أفضل وجبة بعد التمرين لبناء العضلات؟', en: 'Best post-workout meal?' },
          { ar: 'عندي إرهاق خفيف في الركبة، هل ألعب رجلين؟', en: 'Slight knee fatigue, should I train?' },
          { ar: 'محتاج مراجعة على سعراتي والماكروز اليوم', en: 'Review my daily macros & calories' },
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              playWhatsAppSendSound();
              sendChatMessage(isAr ? chip.ar : chip.en, currentRole, { memberId, trainerId });
            }}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500"
          >
            💬 {isAr ? chip.ar : chip.en}
          </button>
        ))}
      </div>

      {/* 4. WhatsApp Bottom Input Bar */}
      <div className="border-t border-slate-300 bg-[#F0F2F5] p-3 dark:border-slate-800 dark:bg-[#202C33]">
        {isRecordingVoice ? (
          /* Live Voice Recording State */
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-sm dark:bg-[#111B21]">
            <div className="flex items-center gap-2 text-rose-500 font-mono text-xs font-black">
              <span className="h-3 w-3 animate-ping rounded-full bg-rose-500" />
              <span>{formatSecs(recordingSeconds)}</span>
              <span className="text-slate-400 text-[11px] font-sans">
                {isAr ? 'جاري تسجيل الصوت...' : 'Recording voice note...'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelVoiceRecording}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-black text-white hover:bg-emerald-500 shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isAr ? 'إرسال الفويس' : 'Send Voice'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard WhatsApp Text & Media Form */
          <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
            {/* Attachment Button */}
            <label
              title={isAr ? 'إرفاق صورة تمرين أو وجبة أو إيصال' : 'Attach workout photo or receipt'}
              className="cursor-pointer rounded-full p-2.5 text-slate-600 hover:bg-slate-200 transition dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Paperclip className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
            </label>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب رسالتك للكابتن كأنك في الواتساب تماماً...'
                  : 'Type a message like on WhatsApp...'
              }
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-[#2A3942] dark:text-white"
            />

            {/* Send or Voice Note Button */}
            {inputText.trim() ? (
              <button
                type="submit"
                aria-label={isAr ? 'إرسال الرسالة' : 'Send message'}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
              >
                <Send className="h-5 w-5 ms-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartVoiceRecording}
                title={isAr ? 'تسجيل رسالة صوتية (فويس نوت)' : 'Record Voice Note'}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </form>
        )}
      </div>

      {/* 5. Image Attachment Caption Modal */}
      {showImageAttachModal && previewAttachmentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-[#1F2C34] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-black text-emerald-400">
                {isAr ? 'إرسال صورة في المحادثة' : 'Send Image in Chat'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowImageAttachModal(false);
                  setPreviewAttachmentUrl(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3 max-h-64 overflow-hidden rounded-2xl bg-black">
              <img
                src={previewAttachmentUrl}
                alt="Preview"
                className="mx-auto max-h-64 object-contain"
              />
            </div>

            <input
              type="text"
              value={attachmentCaption}
              onChange={(e) => setAttachmentCaption(e.target.value)}
              placeholder={
                isAr
                  ? 'أضف تعليقاً على الصورة (مثال: تكنيك التمرين / صورة وجبة الغداء / وصل التحويل)...'
                  : 'Add a caption...'
              }
              className="w-full rounded-xl border border-slate-700 bg-[#2A3942] px-3 py-2 text-xs font-bold text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageAttachModal(false);
                  setPreviewAttachmentUrl(null);
                }}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendAttachedImage}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-500 shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>{isAr ? 'إرسال الصورة' : 'Send Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Active Call Simulation Modal */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-[#111B21] p-6 text-center text-white shadow-2xl">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={contactAvatar}
                alt={isAr ? contactNameAr : contactNameEn}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-500"
              />
              <span className="absolute bottom-1 end-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
            </div>

            <h3 className="mt-4 text-lg font-black text-white">
              {isAr ? contactNameAr : contactNameEn}
            </h3>
            <p className="font-mono text-xs text-emerald-400">
              {activeCallType === 'VIDEO'
                ? isAr
                  ? 'مكالمة فيديو واتساب جارية...'
                  : 'WhatsApp Video Call...'
                : isAr
                ? 'مكالمة صوتية واتساب جارية...'
                : 'WhatsApp Audio Call...'}
            </p>
            <p className="mt-1 font-mono text-sm font-black text-white">
              {formatSecs(callDurationSec)}
            </p>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setActiveCallType(null)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 hover:bg-rose-500 active:scale-95 transition"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
            <span className="mt-2 block text-[11px] text-slate-400">
              {isAr ? 'إنهاء المكالمة' : 'End Call'}
            </span>
          </div>
        </div>
      )}

      {/* 7. Full-Size Image Preview */}
      {viewingFullImageUrl && (
        <div
          onClick={() => setViewingFullImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <div className="relative max-h-[85vh] max-w-2xl">
            <img
              src={viewingFullImageUrl}
              alt="Full size preview"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setViewingFullImageUrl(null)}
              className="absolute top-3 end-3 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
