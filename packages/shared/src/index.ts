export const SUBJECTS = [
  'deutsch',
  'mathematik',
  'sachkunde',
  'englisch',
  'kunst',
  'musik',
  'sport',
  'sonstiges',
] as const;

export type Subject = (typeof SUBJECTS)[number];

export type ScanStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type InsightLevel = 'stärke' | 'schwäche' | 'neutral';

export const SUBJECT_LABELS: Record<Subject, string> = {
  deutsch: 'Deutsch',
  mathematik: 'Mathematik',
  sachkunde: 'Sachkunde',
  englisch: 'Englisch',
  kunst: 'Kunst',
  musik: 'Musik',
  sport: 'Sport',
  sonstiges: 'Sonstiges',
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  deutsch: '#4CAF50',
  mathematik: '#FFB300',
  sachkunde: '#42A5F5',
  englisch: '#1E4FD9',
  kunst: '#E91E63',
  musik: '#9C27B0',
  sport: '#FF5722',
  sonstiges: '#607D8B',
};

export interface Profile {
  id: string;
  display_name: string | null;
  consent_given_at: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_year: number;
  school_type: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  child_id: string;
  storage_path: string;
  status: ScanStatus;
  scanned_at: string;
  error_message: string | null;
}

export interface Analysis {
  id: string;
  scan_id: string;
  subject: Subject;
  subject_override: Subject | null;
  grade_or_score: string | null;
  raw_extraction: Record<string, unknown> | null;
  summary_de: string | null;
  confidence: number | null;
  created_at: string;
}

export interface TopicInsight {
  id: string;
  analysis_id: string;
  topic: string;
  level: InsightLevel;
  explanation_de: string;
}

export interface ScanWithAnalysis extends Scan {
  analyses: (Analysis & { topic_insights: TopicInsight[] }) | null;
}

export interface LlmExtractionResult {
  subject: Subject;
  date: string | null;
  grade_or_score: string | null;
  topics: Array<{
    topic: string;
    correct: boolean | null;
    confidence: number;
  }>;
  confidence: number;
}

export interface LlmAnalysisResult {
  summary_de: string;
  topic_insights: Array<{
    topic: string;
    level: InsightLevel;
    explanation_de: string;
  }>;
}
