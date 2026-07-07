import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { reviewApi } from "@/api/endpoints";
import type { AnalyzeResult, ReviewHistoryItem } from "@/api/types";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Input, Label, Textarea } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { columnHero } from "@/assets";
import { EmptyState, Spinner } from "@/components/States";
import { Upload } from "@/components/Upload";

export default function ReviewPage() {
  const [title, setTitle] = React.useState("面试复盘");
  const [transcript, setTranscript] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [report, setReport] = React.useState<AnalyzeResult | null>(null);
  const [history, setHistory] = React.useState<ReviewHistoryItem[]>([]);

  const loadHistory = React.useCallback(async () => {
    setHistory(await reviewApi.history());
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleAudio = async (blob: Blob, filename = "recording.webm") => {
    setLoading(true);
    setStatus("上传并转写中…");
    try {
      const { file_id } = await reviewApi.upload(blob, filename);
      const { transcript: t } = await reviewApi.transcribe(file_id);
      setTranscript(t);
      setStatus("转写完成，可编辑后生成复盘");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!transcript.trim()) {
      setStatus("请先录音/上传或粘贴转写文本");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const r = await reviewApi.analyze(transcript, title);
      setReport(r);
      await loadHistory();
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.map((h, i) => ({
    name: `#${i + 1}`,
    综合: h.overall_score,
    清晰: h.clarity_score,
    结构: h.structure_score,
    自信: h.confidence_score,
  }));

  return (
    <div>
      <PageHeader
        title="面试复盘"
        subtitle="录音或上传音频，转写后生成结构化复盘报告，并追踪多场面试的表现趋势。"
        persona="产运导师 Nova"
        action={
          <img src={columnHero.review} alt="" className="hidden h-16 rounded-card shadow-card sm:block" />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader title="① 采集面试内容" desc="浏览器录音 或 上传音频文件" />
            <CardBody className="space-y-5">
              <AudioRecorder onRecorded={(b) => handleAudio(b)} />
              <div className="relative text-center text-xs text-[var(--text-muted)]">
                <span className="bg-[var(--surface)] px-2">或</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-[var(--border)]" />
              </div>
              <Upload
                accept="audio/*"
                hint="上传音频文件（mp3 / wav / m4a / webm）"
                onFile={(f) => handleAudio(f, f.name)}
              />
              {status && (
                <p className="text-center text-xs text-[var(--text-muted)]">
                  {status}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="② 转写文本" desc="可编辑修正后生成复盘" />
            <CardBody className="space-y-3">
              <div>
                <Label>复盘标题</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <Textarea
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="转写文本会出现在这里，也可手动粘贴…"
              />
              <Button variant="primary" loading={loading} onClick={analyze}>
                生成复盘报告
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {loading && !report && (
            <Card>
              <Spinner label="生成复盘报告" />
            </Card>
          )}
          {report && (
            <Card>
              <CardHeader title="复盘报告" desc={report.title} />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["综合", report.overall_score],
                    ["清晰", report.clarity_score],
                    ["结构", report.structure_score],
                    ["自信", report.confidence_score],
                  ].map(([label, v]) => (
                    <div
                      key={label as string}
                      className="rounded-btn bg-brand-50 py-3 dark:bg-ink-800"
                    >
                      <p className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                        {v}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>

                <Section title="时间线要点" items={report.timeline} />
                <Section title="答得好" items={report.strengths} tone="good" />
                <Section title="待改进" items={report.improvements} tone="warn" />
                <Section title="下次行动项" items={report.action_items} />
                <div className="rounded-btn bg-ink-50 p-3 text-sm dark:bg-ink-800">
                  <span className="font-semibold">情绪与表达：</span>
                  {report.emotion}
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="表现趋势" desc="多场面试评分变化" />
            <CardBody>
              {chartData.length === 0 ? (
                <EmptyState title="暂无历史" desc="生成第一份复盘后展示趋势" />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e9ee" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="综合" stroke="#1f8f74" strokeWidth={2} />
                      <Line type="monotone" dataKey="清晰" stroke="#ff7a45" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="结构" stroke="#42ab90" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="自信" stroke="#9aa5b1" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "good" | "warn";
}) {
  const dot =
    tone === "good"
      ? "bg-brand-500"
      : tone === "warn"
        ? "bg-accent-500"
        : "bg-ink-400";
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{title}</p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--text-muted)]">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
