import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useModalLock } from '../utils/useModalLock';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextInfo?: {
    passageRef?: string;
    heroName?: string;
    screenName?: string;
  };
}

const REPORT_REASONS = [
  'Theological or doctrinal concern',
  'Misquoted or misrepresented my decision',
  'Scripture translation error',
  'Confusing or offensive wording',
  'Other content issue'
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  contextInfo
}) => {
  const modalRef = useModalLock(isOpen);
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playClick();
    setIsSubmitted(false);
    setUserComment('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSnap();

    const report = {
      id: `report-${Date.now()}`,
      timestamp: Date.now(),
      dateString: new Date().toISOString(),
      reason: selectedReason,
      comment: userComment.trim(),
      passageRef: contextInfo?.passageRef || 'Daily Mission',
      heroName: contextInfo?.heroName || 'Biblical Narrative',
      screen: contextInfo?.screenName || 'Story Viewer'
    };

    try {
      const existing = localStorage.getItem('testament_content_reports');
      const list = existing ? JSON.parse(existing) : [];
      list.push(report);
      localStorage.setItem('testament_content_reports', JSON.stringify(list));
    } catch {
      // ignore
    }

    setIsSubmitted(true);
  };

  const mailtoUrl = `mailto:feedback@testament.app?subject=${encodeURIComponent(
    `Content Issue Report: ${contextInfo?.passageRef || 'Daily Mission'}`
  )}&body=${encodeURIComponent(
    `Reason: ${selectedReason}\nContext: ${contextInfo?.heroName || ''} (${contextInfo?.passageRef || ''})\nComments: ${userComment.trim()}`
  )}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity overscroll-contain"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 text-left transition-colors outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle aria-hidden="true" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 id="report-issue-title" className="text-base font-serif font-bold text-stone-900 dark:text-parchment-50">
              Report an Issue with Today's Reflection
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            <X aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 aria-hidden="true" className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-parchment-100">
              Thank you for keeping Testament faithful.
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
              Your feedback was logged directly for pastoral and editorial review.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary w-full text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {contextInfo?.passageRef && (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Passage: <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{contextInfo.passageRef}</span> ({contextInfo.heroName})
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="issue-reason" className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                What went wrong?
              </label>
              <select
                id="issue-reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-parchment-100 outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="issue-comment" className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                Details (optional)
              </label>
              <textarea
                id="issue-comment"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Describe what was off or mischaracterized..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-parchment-100 outline-hidden focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="btn-primary flex-1 text-xs cursor-pointer"
              >
                Submit Report
              </button>
              <a
                href={mailtoUrl}
                className="p-2.5 rounded-xl bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs inline-flex items-center justify-center transition-colors"
                title="Send via Email"
                aria-label="Send via Email"
              >
                <Mail aria-hidden="true" className="w-4 h-4" />
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
