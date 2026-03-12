import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Vitals {
  hr: number | string;
  spo2: number | string;
  temp: number | string;
  humidity: number | string;
  airQuality: string;
}

export interface DiagnosisResult {
  severity: string;
  diagnosis: string;
  action: string;
  riskLevel?: string;
}

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  conditions: string;
  height?: string;
  weight?: string;
  bmi?: string;
  profession?: string;
  married?: boolean;
  sleep?: string;
  exercise?: string;
  smoking?: boolean;
  alcohol?: boolean;
  sugarIntake?: string;
}

interface AppContextType {
  bleConnected: boolean;
  toggleBLE: () => void;
  vitals: Vitals;
  diagnosisResult: DiagnosisResult | null;
  loading: boolean;
  analyzeSymptoms: (symptoms: string[], notes: string) => Promise<void>;
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bleConnected, setBleConnected] = useState(false);
  const [vitals, setVitals] = useState<Vitals>({
    hr: '--', spo2: '--', temp: '--', humidity: '--', airQuality: '--',
  });
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', age: '', gender: '', conditions: '',
  });

  const toggleBLE = () => {
    if (bleConnected) {
      setBleConnected(false);
      setVitals({ hr: '--', spo2: '--', temp: '--', humidity: '--', airQuality: '--' });
    } else {
      setBleConnected(true);
      setVitals({ hr: 78, spo2: 97, temp: 36.8, humidity: 60, airQuality: 'Normal' });
    }
  };

  const analyzeSymptoms = async (symptoms: string[], notes: string) => {
    setLoading(true);
    setDiagnosisResult(null);

    const vitalsText = bleConnected
      ? `HR: ${vitals.hr} bpm, SpO2: ${vitals.spo2}%, Body Temp: ${vitals.temp}C, Humidity: ${vitals.humidity}%, Air Quality: ${vitals.airQuality}`
      : 'No hardware vitals available.';

    const profileText = userProfile.name
      ? `Age: ${userProfile.age}, Gender: ${userProfile.gender}, BMI: ${userProfile.bmi || 'N/A'}, Height: ${userProfile.height || 'N/A'}cm, Weight: ${userProfile.weight || 'N/A'}kg, Profession: ${userProfile.profession || 'N/A'}, Married: ${userProfile.married ? 'Yes' : 'No'}, Sleep: ${userProfile.sleep || 'N/A'}, Exercise: ${userProfile.exercise || 'N/A'}, Smoking: ${userProfile.smoking ? 'Yes' : 'No'}, Alcohol: ${userProfile.alcohol ? 'Yes' : 'No'}, Sugar intake: ${userProfile.sugarIntake || 'N/A'}, Medical conditions: ${userProfile.conditions || 'None'}`
      : 'No profile provided.';

    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptoms.join(', '),
          notes,
          vitalsText,
          profileText,
        }),
      });

      const parsed = await response.json();
      setDiagnosisResult(parsed);
    } catch (err) {
      setDiagnosisResult({
        severity: 'mild',
        diagnosis: 'Unable to reach AI service. Check your connection and try again.',
        action: 'Retry the analysis or consult a healthcare professional directly.',
      });
    }

    setLoading(false);
  };

  return (
    <AppContext.Provider value={{
      bleConnected, toggleBLE, vitals,
      diagnosisResult, loading, analyzeSymptoms,
      userProfile, setUserProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};