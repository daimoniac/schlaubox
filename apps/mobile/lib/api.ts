import * as Crypto from 'expo-crypto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Analysis, Child, Scan, ScanWithAnalysis, Subject, TopicInsight } from '@schlaubox/shared';
import { supabase } from './supabase';

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Child[];
    },
  });
}

export function useChild(childId: string) {
  return useQuery({
    queryKey: ['children', childId],
    enabled: !!childId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();
      if (error) throw error;
      return data as Child;
    },
  });
}

export function useScans(childId?: string) {
  return useQuery({
    queryKey: ['scans', childId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('scans')
        .select('*, analyses(*, topic_insights(*))')
        .order('scanned_at', { ascending: false });

      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScanWithAnalysis[];
    },
  });
}

export function useScan(scanId: string) {
  return useQuery({
    queryKey: ['scans', 'detail', scanId],
    enabled: !!scanId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*, analyses(*, topic_insights(*))')
        .eq('id', scanId)
        .single();
      if (error) throw error;
      return data as ScanWithAnalysis;
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; birth_year: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('children')
        .insert({ ...input, parent_id: userData.user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['children'] }),
  });
}

export function useAcceptConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ consent_given_at: new Date().toISOString() })
        .eq('id', userData.user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useOverrideSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ analysisId, subject }: { analysisId: string; subject: Subject }) => {
      const { error } = await supabase
        .from('analyses')
        .update({ subject_override: subject })
        .eq('id', analysisId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['scans', 'detail'] });
    },
  });
}

export async function uploadAndProcessScan(childId: string, imageUri: string): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const scanId = Crypto.randomUUID();
  const storagePath = `${userData.user.id}/${childId}/${scanId}.jpg`;

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('scans')
    .upload(storagePath, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from('scans').insert({
    id: scanId,
    child_id: childId,
    storage_path: storagePath,
    status: 'processing',
  });

  if (insertError) throw insertError;

  const { error: fnError } = await supabase.functions.invoke('process-scan', {
    body: { scan_id: scanId },
  });

  if (fnError) throw fnError;

  return scanId;
}

export function getScanImageUrl(storagePath: string) {
  const { data } = supabase.storage.from('scans').getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getSignedScanUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('scans')
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export function effectiveSubject(analysis: Analysis): Subject {
  return analysis.subject_override ?? analysis.subject;
}

export function groupInsights(insights: TopicInsight[]) {
  return {
    strengths: insights.filter((i) => i.level === 'stärke'),
    weaknesses: insights.filter((i) => i.level === 'schwäche'),
    neutral: insights.filter((i) => i.level === 'neutral'),
  };
}
