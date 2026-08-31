import React, { useState, useEffect } from 'react';
import {
  ClipperJob,
  UserAccount,
  PipelineStepNumber,
  WordTimestamp,
  HighlightSegment,
  StyleConfig
} from './types';
import { StorageService, AccessibilitySettings } from './services/storage';
import { SAMPLE_VIDEOS, generateHighlightsForVideo, generateSampleWordsForRange } from './services/mockData';
import { Navigation } from './components/Navigation';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { Dashboard } from './components/Dashboard';
import { WizardProgressBar } from './components/ClipperWizard/WizardProgressBar';
import { Step1Upload } from './components/ClipperWizard/Step1Upload';
import { Step2Transcribe } from './components/ClipperWizard/Step2Transcribe';
import { Step3Highlights } from './components/ClipperWizard/Step3Highlights';
import { Step4ClipSelector } from './components/ClipperWizard/Step4ClipSelector';
import { Step5StyleChoices } from './components/ClipperWizard/Step5StyleChoices';
import { Step6RenderQueue } from './components/ClipperWizard/Step6RenderQueue';
import { Step7DeliverReel } from './components/ClipperWizard/Step7DeliverReel';
import { BackendInspectorModal } from './components/BackendInspectorModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AccessibilityModal } from './components/AccessibilityModal';

export default function App() {
  // --- Global State ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.getTheme());
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(() => StorageService.getA11ySettings());
  const [user, setUser] = useState<UserAccount>(() => StorageService.getUser());
  const [jobs, setJobs] = useState<ClipperJob[]>(() => StorageService.getJobs());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'wizard' | 'reels' | 'pricing'>('dashboard');

  // --- Offline Simulation & Background Sync Queue ---
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<string[]>(() => StorageService.getPendingSyncQueue());

  // --- Active Job in Wizard ---
  const [activeJob, setActiveJob] = useState<ClipperJob>(() => jobs[0] || {
    id: 'job-init',
    title: SAMPLE_VIDEOS[0].title,
    sourceType: 'youtube',
    sourceUrl: SAMPLE_VIDEOS[0].videoUrl,
    fileSizeMb: 850,
    durationSeconds: SAMPLE_VIDEOS[0].durationSec,
    resolution: '1920x1080',
    fps: 60,
    thumbnailUrl: SAMPLE_VIDEOS[0].thumbnail,
    status: 'queued',
    currentStep: 1,
    progressPercent: 0,
    transcriptText: '',
    words: [],
    highlights: [],
    customClipRange: [142, 187],
    styleConfig: {
      captionStyle: 'hormozi',
      aspectRatio: '9:16',
      framing: 'smart_speaker',
      fontSize: 'lg',
      fontFamily: 'display',
      textColor: '#FFFFFF',
      highlightColor: '#FACC15',
      showEmojis: true,
      position: 'middle',
      musicTrack: 'lo-fi-beats',
      musicVolume: 18,
      showBrandLogo: true,
      brandName: '@manweta.ai',
      autoReOffsetTimestamps: true,
    },
    createdAt: new Date().toISOString(),
    syncState: 'synced',
    backendLogs: []
  });

  const [maxAccessibleStep, setMaxAccessibleStep] = useState<PipelineStepNumber>(activeJob.currentStep);

  // --- Modals ---
  const [isBackendInspectorOpen, setIsBackendInspectorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  // Apply Theme & A11y classes to root
  useEffect(() => {
    StorageService.setTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-[#0A0A0A]', 'text-[#EDEDED]');
      document.body.classList.remove('bg-neutral-50', 'text-neutral-900', 'bg-slate-950', 'text-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-[#0A0A0A]', 'text-[#EDEDED]', 'bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-neutral-100', 'text-neutral-900');
    }
  }, [theme]);

  // Handle Online/Offline Automatic Syncing
  useEffect(() => {
    if (!isOfflineSimulated && pendingSyncQueue.length > 0) {
      // Simulate background worker syncing
      const timer = setTimeout(() => {
        const updatedJobs = jobs.map(j => {
          if (pendingSyncQueue.includes(j.id)) {
            return { ...j, syncState: 'synced' as const };
          }
          return j;
        });
        setJobs(updatedJobs);
        StorageService.saveJobs(updatedJobs);
        setPendingSyncQueue([]);
        localStorage.removeItem('manweta_sync_queue_v1');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOfflineSimulated, pendingSyncQueue, jobs]);

  // Sync active job back to storage
  const updateActiveJob = (updated: Partial<ClipperJob>) => {
    const newJob: ClipperJob = { ...activeJob, ...updated };
    setActiveJob(newJob);

    if (isOfflineSimulated) {
      newJob.syncState = 'pending_sync';
      StorageService.enqueueForSync(newJob.id);
      setPendingSyncQueue(prev => prev.includes(newJob.id) ? prev : [...prev, newJob.id]);
    }

    StorageService.saveOrUpdateJob(newJob);
    setJobs(prev => {
      const idx = prev.findIndex(j => j.id === newJob.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newJob;
        return copy;
      }
      return [newJob, ...prev];
    });
  };

  // Start new video clip creation
  const handleStartNewClip = () => {
    const newJobId = 'job_' + Date.now().toString(36);
    const blankJob: ClipperJob = {
      id: newJobId,
      title: 'New Podcast Ingest',
      sourceType: 'sample',
      sourceUrl: SAMPLE_VIDEOS[0].videoUrl,
      sourceFileName: 'podcast_stream.mp4',
      fileSizeMb: 650,
      durationSeconds: SAMPLE_VIDEOS[0].durationSec,
      resolution: '1920x1080',
      fps: 60,
      thumbnailUrl: SAMPLE_VIDEOS[0].thumbnail,
      status: 'queued',
      currentStep: 1,
      progressPercent: 0,
      transcriptText: '',
      words: [],
      highlights: [],
      customClipRange: [142, 187],
      styleConfig: {
        captionStyle: 'hormozi',
        aspectRatio: '9:16',
        framing: 'smart_speaker',
        fontSize: 'lg',
        fontFamily: 'display',
        textColor: '#FFFFFF',
        highlightColor: '#FACC15',
        showEmojis: true,
        position: 'middle',
        musicTrack: 'lo-fi-beats',
        musicVolume: 18,
        showBrandLogo: true,
        brandName: '@manweta.ai',
        autoReOffsetTimestamps: true,
      },
      createdAt: new Date().toISOString(),
      syncState: isOfflineSimulated ? 'pending_sync' : 'synced',
      backendLogs: [
        {
          id: 'log_0',
          timestamp: new Date().toLocaleTimeString(),
          service: 'Queue',
          level: 'info',
          message: 'Initialized new clipper job in state queued'
        }
      ]
    };

    setActiveJob(blankJob);
    setMaxAccessibleStep(1);
    setCurrentTab('wizard');
    StorageService.saveOrUpdateJob(blankJob);
  };

  const handleOpenExistingJob = (job: ClipperJob) => {
    setActiveJob(job);
    setMaxAccessibleStep(job.currentStep);
    setCurrentTab('wizard');
  };

  // --- Step 1 Handlers ---
  const handleVideoSelected = (source: {
    type: 'upload' | 'youtube' | 'sample';
    url: string;
    fileName?: string;
    fileSizeMb: number;
    durationSec: number;
    title: string;
    thumbnail: string;
  }) => {
    const highlights = generateHighlightsForVideo(source.title, source.durationSec);
    const words = generateSampleWordsForRange(highlights[0]?.startTime || 142, highlights[0]?.endTime || 187);

    updateActiveJob({
      title: source.title,
      sourceType: source.type,
      sourceUrl: source.url,
      sourceFileName: source.fileName,
      fileSizeMb: source.fileSizeMb,
      durationSeconds: source.durationSec,
      thumbnailUrl: source.thumbnail,
      status: 'transcribing',
      currentStep: 2,
      progressPercent: 20,
      highlights,
      words,
      selectedHighlightId: highlights[0]?.id,
      customClipRange: [highlights[0]?.startTime || 142, highlights[0]?.endTime || 187],
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'ffprobe',
          level: 'success',
          message: `Stream validated: 1080p H.264 AAC (${source.fileSizeMb}MB)`
        },
        {
          id: 'log_s3_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'S3',
          level: 'success',
          message: `Multipart payload stored to s3://manweta-raw-videos/${activeJob.id}.mp4`
        }
      ]
    });

    setMaxAccessibleStep(2);
  };

  // --- Step 2 Handlers ---
  const handleTranscriptionComplete = (words: WordTimestamp[], fullText: string) => {
    updateActiveJob({
      status: 'analyzing',
      currentStep: 3,
      progressPercent: 40,
      words,
      transcriptText: fullText,
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_wh_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'Whisper',
          level: 'success',
          message: `Generated ${words.length} word-level tokens with high acoustic confidence`
        }
      ]
    });
    setMaxAccessibleStep(3);
  };

  // --- Step 3 Handlers ---
  const handleSelectHighlight = (highlight: HighlightSegment) => {
    updateActiveJob({
      selectedHighlightId: highlight.id,
      customClipRange: [highlight.startTime, highlight.endTime],
      status: 'awaiting_selection',
      currentStep: 4,
      progressPercent: 60,
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_llm_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'LLM_Analyzer',
          level: 'success',
          message: `Selected candidate #${highlight.id}: "${highlight.title}" (${highlight.score}% Hook probability)`
        }
      ]
    });
    setMaxAccessibleStep(4);
  };

  // --- Step 4 Handlers ---
  const handleConfirmRange = (range: [number, number], selectedHighlightId?: string) => {
    updateActiveJob({
      customClipRange: range,
      selectedHighlightId,
      currentStep: 5,
      progressPercent: 75,
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_trim_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'Queue',
          level: 'info',
          message: `Stored In/Out boundaries: ${range[0]}s -> ${range[1]}s (duration: ${(range[1] - range[0]).toFixed(1)}s)`
        }
      ]
    });
    setMaxAccessibleStep(5);
  };

  // --- Step 5 Handlers ---
  const handleSaveStyles = (styleConfig: StyleConfig) => {
    updateActiveJob({
      styleConfig,
      status: 'rendering',
      currentStep: 6,
      progressPercent: 85,
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_style_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'Queue',
          level: 'info',
          message: `Attached render config: ${styleConfig.captionStyle} captions, ${styleConfig.aspectRatio}, music: ${styleConfig.musicTrack}`
        }
      ]
    });
    setMaxAccessibleStep(6);
  };

  // --- Step 6 Handlers ---
  const handleRenderComplete = (renderedUrl: string) => {
    // Deduct user credits (e.g. 1 minute)
    StorageService.deductCredits(1);
    setUser(StorageService.getUser());

    updateActiveJob({
      renderedVideoUrl: renderedUrl,
      status: 'done',
      currentStep: 7,
      progressPercent: 100,
      completedAt: new Date().toISOString(),
      backendLogs: [
        ...(activeJob.backendLogs || []),
        {
          id: 'log_ff_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'FFmpeg',
          level: 'success',
          message: 'Video filtered to 9:16, burned re-offset ASS subtitles, encoded to H.264 MP4'
        },
        {
          id: 'log_deliv_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          service: 'S3',
          level: 'success',
          message: 'Delivered final reel to CDN & broadcasted WebSocket completion event'
        }
      ]
    });
    setMaxAccessibleStep(7);
  };

  return (
    <div
      id="manweta-ai-app-root"
      className={`min-h-screen flex flex-col transition-colors ${
        a11ySettings.highContrast ? 'contrast-125' : ''
      } ${a11ySettings.largeText ? 'text-base' : 'text-sm'}`}
    >
      {/* Top Header Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        isOfflineSimulated={isOfflineSimulated}
        setIsOfflineSimulated={setIsOfflineSimulated}
        pendingSyncCount={pendingSyncQueue.length}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenA11y={() => setIsA11yOpen(true)}
        onOpenBackendInspector={() => setIsBackendInspectorOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onStartNewClip={handleStartNewClip}
      />

      {/* Offline / Background Sync Banner */}
      <OfflineSyncBanner
        isOffline={isOfflineSimulated}
        pendingCount={pendingSyncQueue.length}
        onForceSync={() => {
          setIsOfflineSimulated(false);
        }}
        onToggleOffline={() => setIsOfflineSimulated(false)}
        theme={theme}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {/* VIEW 1: Dashboard */}
        {currentTab === 'dashboard' && (
          <Dashboard
            jobs={jobs}
            user={user}
            onStartNewClip={handleStartNewClip}
            onOpenJob={handleOpenExistingJob}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            isOffline={isOfflineSimulated}
            theme={theme}
          />
        )}

        {/* VIEW 2: 7-Step Clipper Pipeline Wizard */}
        {currentTab === 'wizard' && (
          <div id="clipper-wizard-workflow-wrapper" className="space-y-6">
            <WizardProgressBar
              currentStep={activeJob.currentStep}
              jobStatus={activeJob.status}
              maxAccessibleStep={maxAccessibleStep}
              onStepClick={(step) => {
                updateActiveJob({ currentStep: step });
              }}
              theme={theme}
            />

            {/* Step 1: Upload or link */}
            {activeJob.currentStep === 1 && (
              <Step1Upload
                onVideoSelected={handleVideoSelected}
                theme={theme}
                isOffline={isOfflineSimulated}
              />
            )}

            {/* Step 2: Transcribe audio */}
            {activeJob.currentStep === 2 && (
              <Step2Transcribe
                job={activeJob}
                onTranscriptionComplete={handleTranscriptionComplete}
                theme={theme}
              />
            )}

            {/* Step 3: Detect highlights */}
            {activeJob.currentStep === 3 && (
              <Step3Highlights
                job={activeJob}
                onSelectHighlight={handleSelectHighlight}
                theme={theme}
              />
            )}

            {/* Step 4: User selects clip */}
            {activeJob.currentStep === 4 && (
              <Step4ClipSelector
                job={activeJob}
                onConfirmSelection={handleConfirmRange}
                theme={theme}
              />
            )}

            {/* Step 5: Style choices */}
            {activeJob.currentStep === 5 && (
              <Step5StyleChoices
                job={activeJob}
                onSaveStyles={handleSaveStyles}
                theme={theme}
              />
            )}

            {/* Step 6: Render the clip */}
            {activeJob.currentStep === 6 && (
              <Step6RenderQueue
                job={activeJob}
                onRenderComplete={handleRenderComplete}
                theme={theme}
              />
            )}

            {/* Step 7: Deliver the reel */}
            {activeJob.currentStep === 7 && (
              <Step7DeliverReel
                job={activeJob}
                onClipAnother={() => {
                  updateActiveJob({ currentStep: 3, status: 'analyzing' });
                }}
                onStartNewVideo={handleStartNewClip}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                theme={theme}
              />
            )}
          </div>
        )}

        {/* VIEW 3: Pricing & Credits */}
        {currentTab === 'pricing' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Transparent High-Volume Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Scale Your Short-Form Viral Distribution
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pick a plan tailored for creators, podcasts, and digital agencies. Includes 14-day money-back guarantee.
              </p>
            </div>

            <div className="pt-4">
              <button
                id="open-full-checkout-btn"
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-2xl flex items-center justify-center gap-2"
              >
                <span>Open Interactive Upgrade & Checkout Modal</span>
              </button>
            </div>

            {/* Embedded Pricing Cards */}
            <Dashboard
              jobs={jobs}
              user={user}
              onStartNewClip={handleStartNewClip}
              onOpenJob={handleOpenExistingJob}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              isOffline={isOfflineSimulated}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <BackendInspectorModal
        isOpen={isBackendInspectorOpen}
        onClose={() => setIsBackendInspectorOpen(false)}
        currentJob={activeJob}
        theme={theme}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        user={user}
        onSuccessUpgrade={(updated) => setUser(updated)}
        theme={theme}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onAuthSuccess={(updated) => setUser(updated)}
        theme={theme}
      />

      <AccessibilityModal
        isOpen={isA11yOpen}
        onClose={() => setIsA11yOpen(false)}
        settings={a11ySettings}
        onUpdateSettings={(newSettings) => {
          setA11ySettings(newSettings);
          StorageService.saveA11ySettings(newSettings);
        }}
        theme={theme}
      />
    </div>
  );
}
