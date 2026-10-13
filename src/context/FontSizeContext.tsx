import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScaleStep = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface FontScaleConfig {
  step: FontScaleStep;
  label: string;
  scale: number;
}

export const FONT_SCALE_STEPS: FontScaleConfig[] = [
  { step: 'xs', label: 'XS', scale: 0.88 },
  { step: 's', label: 'S', scale: 0.95 },
  { step: 'm', label: 'M', scale: 1.0 },
  { step: 'l', label: 'L', scale: 1.15 },
  { step: 'xl', label: 'XL', scale: 1.35 },
];

const STORAGE_KEY = 'testament_font_scale_step';
const DEFAULT_STEP: FontScaleStep = 'm';

interface FontSizeContextType {
  currentStep: FontScaleStep;
  scale: number;
  setFontScaleStep: (step: FontScaleStep) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  currentStep: DEFAULT_STEP,
  scale: 1.0,
  setFontScaleStep: () => {},
});

export function getStoredFontScaleStep(): FontScaleStep {
  if (typeof window === 'undefined') return DEFAULT_STEP;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as FontScaleStep | null;
    if (stored && FONT_SCALE_STEPS.some((s) => s.step === stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_STEP;
}

export function applyFontScale(step: FontScaleStep): void {
  if (typeof document === 'undefined') return;
  const match = FONT_SCALE_STEPS.find((s) => s.step === step) || FONT_SCALE_STEPS[2];
  document.documentElement.style.setProperty('--app-font-scale', String(match.scale));
  try {
    localStorage.setItem(STORAGE_KEY, step);
  } catch {
    // ignore
  }
}

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<FontScaleStep>(() => getStoredFontScaleStep());

  useEffect(() => {
    applyFontScale(currentStep);
  }, [currentStep]);

  const setFontScaleStep = (step: FontScaleStep) => {
    setCurrentStep(step);
    applyFontScale(step);
  };

  const scaleConfig = FONT_SCALE_STEPS.find((s) => s.step === currentStep) || FONT_SCALE_STEPS[2];

  return (
    <FontSizeContext.Provider
      value={{
        currentStep,
        scale: scaleConfig.scale,
        setFontScaleStep,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  return useContext(FontSizeContext);
};
