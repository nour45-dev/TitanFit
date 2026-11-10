'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Flame,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CartoonAthleteVisualCanvas,
  type ExerciseMotionType,
} from './exercise-motion-card';
import { getMediaBlob, getMediaUrl } from '../lib/media-storage';

export interface BuiltInWorkoutVideoPlayerProps {
  titleAr: string;
  titleEn: string;
  coachAr: string;
  coachEn: string;
  motionType: ExerciseMotionType;
  targetMuscleAr: string;
  targetMuscleEn: string;
  sets: number;
  reps: string;
  restSec: number;
  safetyTipAr: string;
  safetyTipEn: string;
  thumbnailUrl?: string;
  videoSourceType?: 'BUILTIN_ANIMATION' | 'VIDEO_URL' | 'UPLOADED_FILE';
  videoUrl?: string;
  isAr: boolean;
  onCompleteWorkoutSet?: (completedSet: number) => void;
}

export function BuiltInWorkoutVideoPlayer({
  titleAr,
  titleEn,
  coachAr,
  coachEn,
  motionType,
  targetMuscleAr,
  targetMuscleEn,
  sets,
  reps,
  restSec,
  safetyTipAr,
  safetyTipEn,
  thumbnailUrl,
  videoSourceType = 'BUILTIN_ANIMATION',
  videoUrl,
  isAr,
  onCompleteWorkoutSet,
}: BuiltInWorkoutVideoPlayerProps) {
  const hasExternalOrUploadedVideo = Boolean(
    (videoUrl && videoUrl.trim().length > 0) ||
      videoSourceType === 'UPLOADED_FILE' ||
      videoSourceType === 'VIDEO_URL',
  );
  const [activeMode, setActiveMode] = useState<'ANIMATED_STUDIO' | 'EXTERNAL_VIDEO'>(
    videoSourceType !== 'BUILTIN_ANIMATION' || hasExternalOrUploadedVideo
      ? 'EXTERNAL_VIDEO'
      : 'ANIMATED_STUDIO',
  );

  const [resolvedSrc, setResolvedSrc] = useState<string>(videoUrl || '');

  useEffect(() => {
    if (
      videoSourceType === 'UPLOADED_FILE' ||
      videoSourceType === 'VIDEO_URL' ||
      (videoUrl && videoUrl.trim().length > 0) ||
      (resolvedSrc && resolvedSrc.trim().length > 0)
    ) {
      setActiveMode('EXTERNAL_VIDEO');
    } else {
      setActiveMode('ANIMATED_STUDIO');
    }
  }, [videoSourceType, videoUrl, resolvedSrc, motionType]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 1.5>(1);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [phaseIndex, setPhaseIndex] = useState<0 | 1 | 2>(0); // 0: Eccentric, 1: Hold/Peak, 2: Concentric
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [voiceCueEnabled, setVoiceCueEnabled] = useState<boolean>(false);

  // External / Uploaded video playback state
  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [codecWarning, setCodecWarning] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setVideoStarted(false);
    setCodecWarning(false);
    setVideoCurrentTime(0);
    setIsVideoPaused(true);

    let active = true;
    if (videoUrl?.startsWith('idb://')) {
      const key = videoUrl.replace('idb://', '');
      getMediaUrl(key).then((liveUrl) => {
        if (active && liveUrl) {
          setResolvedSrc(liveUrl);
        }
      });
    } else {
      setResolvedSrc(videoUrl || '');
    }
    return () => {
      active = false;
    };
  }, [videoUrl]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const syncDuration = (el: HTMLVideoElement) => {
    const d = el.duration;
    if (d && !isNaN(d) && isFinite(d) && d > 0) {
      setVideoDuration(d);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      // If video reached the end or is within 0.3s of the end, restart cleanly from 0
      if (
        videoRef.current.ended ||
        (videoRef.current.duration > 0 &&
          videoRef.current.currentTime >= videoRef.current.duration - 0.3)
      ) {
        videoRef.current.currentTime = 0;
        setVideoCurrentTime(0);
      }
      videoRef.current
        .play()
        .then(() => {
          setIsVideoPaused(false);
          setVideoStarted(true);
        })
        .catch((err) => {
          console.warn('Playback error or policy:', err);
        });
    } else {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setVideoCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setVideoCurrentTime(0);
    videoRef.current
      .play()
      .then(() => {
        setIsVideoPaused(false);
        setVideoStarted(true);
      })
      .catch(() => {});
  };

  const targetRepsNum = parseInt(reps.replace(/[^0-9]/g, '').slice(0, 2) || '10', 10) || 10;

  // Cycle through biomechanical phases and reps when playing
  useEffect(() => {
    if (!isPlaying || restCountdown !== null) return;

    const phaseDurationMs = Math.round(1350 / speedMultiplier);
    const interval = setInterval(() => {
      setPhaseIndex((prevPhase) => {
        if (prevPhase === 0) return 1;
        if (prevPhase === 1) return 2;
        // Completed 1 full rep
        setCurrentRep((prevRep) => {
          if (prevRep >= targetRepsNum) {
            return 1;
          }
          return prevRep + 1;
        });
        return 0;
      });
    }, phaseDurationMs);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, targetRepsNum, restCountdown]);

  // Rest timer countdown
  useEffect(() => {
    if (restCountdown === null) return;
    if (restCountdown <= 0) {
      setRestCountdown(null);
      setIsPlaying(true);
      return;
    }
    const timer = setTimeout(() => {
      setRestCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [restCountdown]);

  const phases = [
    {
      labelAr: '١. النزول البطيء والتحكم (Eccentric 3s)',
      labelEn: '1. Controlled Lowering (Eccentric 3s)',
      breathAr: 'شهيق عميق من الأنف 🌬️',
      breathEn: 'Inhale deeply through nose 🌬️',
      color: 'from-sky-500 to-blue-600',
    },
    {
      labelAr: '٢. ذروة الانقباض والثبات (Peak Contraction 1s)',
      labelEn: '2. Peak Muscle Contraction (Hold 1s)',
      breathAr: 'شد العضلة المستهدفة بالكامل ⚡',
      breathEn: 'Squeeze target muscle hard ⚡',
      color: 'from-amber-500 to-orange-500',
    },
    {
      labelAr: '٣. الدفع أو السحب القوي (Concentric 1s)',
      labelEn: '3. Explosive Drive (Concentric 1s)',
      breathAr: 'زفير قوي من الفم 🔥',
      breathEn: 'Exhale forcefully through mouth 🔥',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const activePhase = phases[phaseIndex] ?? phases[0]!;

  const handleFinishSet = () => {
    const nextSet = currentSet < sets ? currentSet + 1 : 1;
    setCurrentSet(nextSet);
    setCurrentRep(1);
    setRestCountdown(restSec || 60);
    if (onCompleteWorkoutSet) {
      onCompleteWorkoutSet(currentSet);
    }
  };

  const isDirectVideoFile = Boolean(
    videoSourceType === 'UPLOADED_FILE' ||
      (videoUrl &&
        (videoUrl.startsWith('data:video/') ||
          videoUrl.startsWith('data:application/octet-stream') ||
          videoUrl.startsWith('blob:') ||
          videoUrl.startsWith('idb://') ||
          /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(videoUrl))) ||
      (resolvedSrc &&
        (resolvedSrc.startsWith('blob:') ||
          resolvedSrc.startsWith('data:video/') ||
          /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(resolvedSrc))),
  );

  const handleVideoPlaying = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoStarted(true);
    e.currentTarget.removeAttribute('poster');
    // Detect HEVC / QuickTime on Windows Chromium (audio plays but video track width is 0)
    if (e.currentTarget.currentTime > 0.5 && e.currentTarget.videoWidth === 0) {
      setCodecWarning(true);
    }
  };

  return (
    <div
      data-testid="builtin-workout-video-player"
      className="overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-950 text-white shadow-2xl dark:border-slate-800"
    >
      {/* Top Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/95 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black text-emerald-300 ring-1 ring-emerald-500/40">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            {isAr ? 'استوديو فيديو TitanFit التفاعلي المدمج' : 'TitanFit Built-In Animated Video Studio'}
          </span>
          <span className="hidden text-xs font-bold text-slate-400 sm:inline">
            • {isAr ? coachAr : coachEn}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="switch-animated-studio-btn"
            onClick={() => setActiveMode('ANIMATED_STUDIO')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              activeMode === 'ANIMATED_STUDIO'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            {isAr ? '🎬 الفيديو المتحرك الذاتي (مدمج)' : '🎬 Built-In Animated Coach'}
          </button>

          {hasExternalOrUploadedVideo && (
            <button
              type="button"
              data-testid="switch-external-video-btn"
              onClick={() => setActiveMode('EXTERNAL_VIDEO')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                activeMode === 'EXTERNAL_VIDEO'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              {isAr ? '📺 فيديو المدرب / الملف المرفوع' : '📺 Uploaded / External Video'}
            </button>
          )}
        </div>
      </div>

      {/* Main Video Stage */}
      {activeMode === 'EXTERNAL_VIDEO' && hasExternalOrUploadedVideo ? (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
          className="group relative aspect-video w-full overflow-hidden bg-slate-950 select-none"
        >
          {isDirectVideoFile ? (
            <>
              <video
                ref={videoRef}
                key={resolvedSrc}
                src={resolvedSrc}
                poster={thumbnailUrl || undefined}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                controls={false}
                playsInline
                preload="auto"
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onClick={togglePlayPause}
                onPlay={() => {
                  setVideoStarted(true);
                  setIsVideoPaused(false);
                }}
                onPause={() => {
                  setIsVideoPaused(true);
                }}
                onLoadedMetadata={(e) => {
                  syncDuration(e.currentTarget);
                }}
                onDurationChange={(e) => {
                  syncDuration(e.currentTarget);
                }}
                onCanPlay={(e) => {
                  syncDuration(e.currentTarget);
                }}
                onPlaying={() => {
                  setVideoStarted(true);
                  setIsVideoPaused(false);
                }}
                onTimeUpdate={(e) => {
                  const cur = e.currentTarget.currentTime || 0;
                  setVideoCurrentTime(cur);
                  const d = e.currentTarget.duration;
                  if (d && !isNaN(d) && isFinite(d) && d > 0 && Math.abs(d - videoDuration) > 0.5) {
                    setVideoDuration(d);
                  }
                }}
                onEnded={() => {
                  setVideoStarted(false);
                  setIsVideoPaused(true);
                }}
                className="h-full w-full object-contain cursor-pointer bg-black"
              />

              {/* Anti-Download DRM Security Badge */}
              <div className="pointer-events-none absolute top-3 end-3 z-30 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/30 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isAr ? '🔒 مشغل محمي ضد التحميل (Anti-Rip DRM)' : '🔒 Protected • No Download'}</span>
              </div>

              {/* Centered Clickable Play Indicator when video is paused */}
              {isVideoPaused && (
                <div
                  onClick={togglePlayPause}
                  className="pointer-events-auto cursor-pointer absolute inset-0 z-20 flex items-center justify-center bg-black/35 transition hover:bg-black/25"
                  title={isAr ? 'اضغط لتشغيل الفيديو والصوت' : 'Click to Play Video & Audio'}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-2xl transition hover:scale-110 hover:bg-amber-400">
                    <Play className="ms-1 h-8 w-8 fill-current" />
                  </div>
                </div>
              )}

              {/* Custom High-Precision Video Control & Progress Bar with Anti-Download Guard */}
              <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-6 pointer-events-auto">
                {/* Scrub Progress Bar */}
                <div className="relative flex items-center mb-2 cursor-pointer">
                  {(() => {
                    const effectiveDuration = Math.max(videoDuration, videoCurrentTime, 1);
                    return (
                      <input
                        type="range"
                        min={0}
                        max={effectiveDuration}
                        step={0.1}
                        value={Math.min(videoCurrentTime, effectiveDuration)}
                        onChange={handleSeek}
                        className="w-full h-1.5 rounded-full appearance-none bg-slate-700/80 cursor-pointer accent-amber-500 transition-all hover:h-2"
                        style={{
                          background: `linear-gradient(to right, #D4AF37 0%, #10B981 ${
                            effectiveDuration > 0 ? (videoCurrentTime / effectiveDuration) * 100 : 0
                          }%, #334155 ${
                            effectiveDuration > 0 ? (videoCurrentTime / effectiveDuration) * 100 : 0
                          }%, #334155 100%)`,
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Player Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shadow-sm"
                      title={isVideoPaused ? (isAr ? 'تشغيل' : 'Play') : (isAr ? 'إيقاف مؤقت' : 'Pause')}
                    >
                      {isVideoPaused ? (
                        <Play className="h-4 w-4 fill-current ms-0.5" />
                      ) : (
                        <Pause className="h-4 w-4 fill-current" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                      title={isAr ? 'إعادة من البداية' : 'Replay'}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                      title={isVideoMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                    >
                      {isVideoMuted ? (
                        <VolumeX className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-emerald-400" />
                      )}
                    </button>

                    <div dir="ltr" className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1 ms-1">
                      <span className="text-amber-400">{formatTime(videoCurrentTime)}</span>
                      <span className="text-slate-500">/</span>
                      <span>{formatTime(Math.max(videoDuration, videoCurrentTime))}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                      {isAr ? '🔒 ضد التحميل • HD 1080p' : '🔒 Protected • HD 1080p'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <iframe
              key={videoUrl}
              src={videoUrl}
              title={isAr ? titleAr : titleEn}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-slate-950 via-[#0B1222] to-slate-950">
          {/* Left/Center 7 Cols: Live Animated Coach Stage */}
          <div className="relative flex flex-col justify-between p-4 sm:p-6 lg:col-span-7 border-b lg:border-b-0 lg:border-e border-slate-800/80">
            {/* Subtle Background Reference Photo Overlay */}
            {thumbnailUrl && (
              <div
                className="pointer-events-none absolute inset-0 opacity-15 mix-blend-luminosity bg-cover bg-center"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              />
            )}

            {/* Top HUD Overlay: Rep Counter & Set Counter */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/90 px-3 py-1 text-xs font-black text-white shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  {isAr ? 'تدريب ذاتي مباشر' : 'LIVE SELF-COACH'}
                </span>
                <span className="rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-1 text-xs font-black text-amber-400">
                  {isAr ? `المجموعة ${currentSet} من ${sets}` : `Set ${currentSet} of ${sets}`}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 px-3.5 py-1.5">
                <Flame className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? 'عداد العدات:' : 'Rep Counter:'}
                </span>
                <span
                  data-testid="live-video-rep-counter"
                  className="font-mono text-base font-black text-emerald-400"
                >
                  {currentRep} / {targetRepsNum}
                </span>
              </div>
            </div>

            {/* Center Animated Biomechanical Vector Video */}
            <div className="relative z-10 my-4 flex items-center justify-center">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-inner">
                <div className="h-56 w-full flex items-center justify-center">
                  <CartoonAthleteVisualCanvas
                    motionType={motionType}
                    isPlaying={isPlaying}
                    speedMultiplier={speedMultiplier}
                    isAr={isAr}
                  />
                </div>
              </div>

              {/* Rest Timer Overlay when resting between sets */}
              <AnimatePresence>
                {restCountdown !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-950/90 p-6 text-center backdrop-blur-md"
                  >
                    <Timer className="h-10 w-10 text-amber-400 animate-bounce" />
                    <p className="mt-2 text-sm font-black text-amber-300">
                      {isAr ? 'وقت الراحة والاستشفاء بين المجموعات' : 'Rest & Recovery Between Sets'}
                    </p>
                    <p className="mt-1 font-mono text-4xl font-black text-white">
                      {restCountdown}s
                    </p>
                    <p className="mt-2 max-w-xs text-xs text-slate-300">
                      {isAr
                        ? 'اشرب رشفة مياه وتنفس بعمق استعداداً للمجموعة التالية.'
                        : 'Take a sip of water and breathe deeply before your next set.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRestCountdown(null)}
                      className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400"
                    >
                      {isAr ? 'تخطي الراحة وبدء المجموعة التالية' : 'Skip Rest & Start Next Set'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Player Controls Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="video-play-pause-btn"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm transition hover:bg-amber-400"
                  title={isPlaying ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentRep(1);
                    setPhaseIndex(0);
                    setIsPlaying(true);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 transition hover:bg-slate-700"
                  title={isAr ? 'إعادة العدات من البداية' : 'Restart Reps'}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
                  {([0.5, 1, 1.5] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`rounded-lg px-2 py-1 font-mono text-[11px] font-black transition ${
                        speedMultiplier === spd
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                data-testid="complete-set-start-rest-btn"
                onClick={handleFinishSet}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isAr
                  ? `أنهيت المجموعة (${currentSet}/${sets}) • ابدأ راحة ${restSec}ث`
                  : `Complete Set (${currentSet}/${sets}) • Rest ${restSec}s`}
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Tempo Phase HUD, Breathing & Muscle Guide */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-5 bg-slate-900/60">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  {isAr ? 'دليل الإيقاع الحركي والتنفس المباشر' : 'LIVE BIOMECHANICAL TEMPO & BREATHING'}
                </span>
                <h4 className="mt-1 text-base font-black text-white">
                  {isAr ? titleAr : titleEn}
                </h4>
              </div>

              {/* Active Tempo Phase Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{isAr ? 'المرحلة الحركية الآن:' : 'Current Tempo Phase:'}</span>
                  <span className="font-mono text-amber-400">3 - 1 - 1 TEMPO</span>
                </div>
                <div
                  className={`mt-2 rounded-xl bg-gradient-to-r ${activePhase.color} p-3.5 text-white shadow-md transition-all`}
                >
                  <p className="text-sm font-black">
                    {isAr ? activePhase.labelAr : activePhase.labelEn}
                  </p>
                  <p className="mt-1 text-xs font-extrabold text-white/95">
                    {isAr ? activePhase.breathAr : activePhase.breathEn}
                  </p>
                </div>

                {/* 3 Phase Pills */}
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {phases.map((p, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg px-2 py-1.5 text-center text-[10px] font-black transition ${
                        phaseIndex === idx
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {idx === 0
                        ? isAr
                          ? '١. نزول ٣ث'
                          : '1. Lower 3s'
                        : idx === 1
                          ? isAr
                            ? '٢. ثبات ١ث'
                            : '2. Hold 1s'
                          : isAr
                            ? '٣. دفع ١ث'
                            : '3. Drive 1s'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Muscle & Prescription Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'المجموعات' : 'Sets'}
                  </p>
                  <p className="mt-0.5 font-mono text-base font-black text-amber-400">{sets}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'العدات' : 'Reps'}
                  </p>
                  <p className="mt-0.5 font-mono text-base font-black text-emerald-400">{reps}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'الراحة' : 'Rest'}
                  </p>
                  <p className="mt-0.5 font-mono text-base font-black text-sky-400">{restSec}s</p>
                </div>
              </div>

              {/* Target Muscle Highlight Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3.5">
                <p className="text-[11px] font-black text-emerald-400">
                  🎯 {isAr ? 'العضلات المستهدفة في هذا التمرين:' : 'Target Muscles Activated:'}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-200">
                  {isAr ? targetMuscleAr : targetMuscleEn}
                </p>
              </div>
            </div>

            {/* Coach Safety Tip Footer */}
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-[11px] font-black text-amber-300">
                    {isAr ? 'نصيحة الأمان والأداء الصحيح:' : 'Biomechanical Form & Safety Tip:'}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-200">
                    {isAr ? safetyTipAr : safetyTipEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
