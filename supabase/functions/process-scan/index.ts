import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBJECTS = [
  'deutsch', 'mathematik', 'sachkunde', 'englisch',
  'kunst', 'musik', 'sport', 'sonstiges',
] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: secretRows } = await admin.from('app_secrets').select('key, value');
    const secrets = Object.fromEntries((secretRows ?? []).map((row) => [row.key, row.value]));
    const openaiKey = secrets.OPENAI_API_KEY ?? Deno.env.get('OPENAI_API_KEY');
    const model = secrets.LLM_MODEL ?? Deno.env.get('LLM_MODEL') ?? 'gpt-5.5';

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { scan_id } = await req.json();
    if (!scan_id) {
      return new Response(JSON.stringify({ error: 'scan_id required' }), { status: 400, headers: corsHeaders });
    }

    const { data: scan, error: scanError } = await userClient
      .from('scans')
      .select('*, children!inner(parent_id)')
      .eq('id', scan_id)
      .single();

    if (scanError || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), { status: 404, headers: corsHeaders });
    }

    if (!openaiKey) {
      await admin.from('scans').update({
        status: 'failed',
        error_message: 'KI nicht konfiguriert. Bitte OPENAI_API_KEY setzen.',
      }).eq('id', scan_id);
      return new Response(JSON.stringify({ error: 'LLM not configured' }), { status: 500, headers: corsHeaders });
    }

    const { data: file, error: downloadError } = await admin.storage
      .from('scans')
      .download(scan.storage_path);

    if (downloadError || !file) {
      await admin.from('scans').update({ status: 'failed', error_message: 'Bild konnte nicht geladen werden.' }).eq('id', scan_id);
      throw downloadError;
    }

    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const systemPrompt = `Du analysierst deutsche Grundschul-Arbeiten (Kinder 6-10).
Antworte NUR mit gültigem JSON ohne Markdown.
Felder:
- subject: eines von ${SUBJECTS.join(', ')}
- date: ISO-Datum oder null
- grade_or_score: Note/Punkte als Text oder "unknown"
- confidence: 0-1
- summary_de: kurze Zusammenfassung für Eltern auf Deutsch
- topic_insights: Array mit { topic, level: "stärke"|"schwäche"|"neutral", explanation_de }
Erfinde keine Noten. Bei unleserlichem Text setze grade_or_score auf "unknown".`;

    const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analysiere diese Schultest-Arbeit.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      await admin.from('scans').update({ status: 'failed', error_message: 'KI-Analyse fehlgeschlagen.' }).eq('id', scan_id);
      throw new Error(errText);
    }

    const llmJson = await llmResponse.json();
    const content = llmJson.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    const subject = SUBJECTS.includes(parsed.subject) ? parsed.subject : 'sonstiges';

    const { data: analysis, error: analysisError } = await admin
      .from('analyses')
      .insert({
        scan_id,
        subject,
        grade_or_score: parsed.grade_or_score ?? null,
        raw_extraction: parsed,
        summary_de: parsed.summary_de ?? null,
        confidence: parsed.confidence ?? null,
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    const insights = (parsed.topic_insights ?? []).map((item: { topic: string; level: string; explanation_de: string }) => ({
      analysis_id: analysis.id,
      topic: item.topic,
      level: ['stärke', 'schwäche', 'neutral'].includes(item.level) ? item.level : 'neutral',
      explanation_de: item.explanation_de,
    }));

    if (insights.length > 0) {
      const { error: insightsError } = await admin.from('topic_insights').insert(insights);
      if (insightsError) throw insightsError;
    }

    await admin.from('scans').update({ status: 'ready', error_message: null }).eq('id', scan_id);

    return new Response(JSON.stringify({ ok: true, analysis_id: analysis.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
