import { ExternalLink, Send, Sparkles } from "lucide-react";
import * as React from "react";
import { prepApi } from "@/api/endpoints";
import type { MockInterview, MockTurn, QuestionBank } from "@/api/types";
import { assets, mascotPose } from "@/assets";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Input, Label, Textarea } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Spinner } from "@/components/States";
import { TrackSwitcher } from "@/components/TrackSwitcher";
import { useTrackStore } from "@/store/track";
import { toast } from "@/store/toast";
import { TRACKS } from "@/theme/tokens";

export default function PrepPage() {
  const { track, setTrack } = useTrackStore();
  const persona = TRACKS.find((t) => t.key === track)?.persona ?? "";
  const [keyword, setKeyword] = React.useState("");
  const [resume, setResume] = React.useState("");
  const [bank, setBank] = React.useState<QuestionBank | null>(null);
  const [activeCat, setActiveCat] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const [mock, setMock] = React.useState<MockInterview | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [mockLoading, setMockLoading] = React.useState(false);

  const loadBank = React.useCallback(async () => {
    setLoading(true);
    try {
      setBank(await prepApi.questionBank(track, keyword));
      setActiveCat(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  React.useEffect(() => {
    loadBank();
    setMock(null);
  }, [loadBank]);

  const startMock = async () => {
    setMockLoading(true);
    try {
      setMock(await prepApi.mockInterview({ track, resume_text: resume }));
      toast.success("模拟面试已开始，祝你顺利！");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setMockLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!mock || !answer.trim()) return;
    setMockLoading(true);
    try {
      const res = await prepApi.mockInterview({
        track,
        resume_text: resume,
        session_id: mock.session_id,
        answer,
        history: mock.history,
      });
      setMock(res);
      setAnswer("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setMockLoading(false);
    }
  };

  const transcript: MockTurn[] = mock?.history ?? [];

  return (
    <div>
      <PageHeader
        title="笔面准备"
        subtitle="按方向汇总四类题库（每方向 100+ 题），并进行人格化多轮模拟面试与结构化打分。"
        persona={persona}
        action={
          <img src={assets.heroPrep} alt="" className="hidden h-16 rounded-card sm:block" />
        }
      />

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div>
            <Label>选择方向（切换后加载对应人格与题库）</Label>
            <TrackSwitcher value={track} onChange={setTrack} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>关键词（可选）</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="如：增长 / 数据分析 / React"
              />
            </div>
            <Button variant="primary" loading={loading} onClick={loadBank}>
              <Sparkles className="h-4 w-4" /> 刷新题库
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="题库汇总"
            desc={bank ? `${bank.label}方向 · 共 ${bank.total} 题` : "四分类题库"}
          />
          <CardBody>
            {loading ? (
              <Spinner />
            ) : !bank ? (
              <EmptyState title="还没有题库" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {bank.categories.map((c, i) => (
                    <button
                      key={c.key}
                      onClick={() => setActiveCat(i)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        i === activeCat
                          ? "bg-accent-500 text-white"
                          : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                      }`}
                    >
                      {c.label} ({c.questions.length})
                    </button>
                  ))}
                </div>
                <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                  {bank.categories[activeCat]?.questions.map((q, i) => (
                    <li
                      key={i}
                      className="rounded-btn bg-ink-50 px-3 py-2 text-sm dark:bg-ink-800"
                    >
                      <span className="mr-1.5 text-xs text-brand-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {q}
                    </li>
                  ))}
                </ul>
                <div>
                  <p className="mb-2 text-sm font-semibold">参考来源（真实可点击）</p>
                  <div className="space-y-2">
                    {bank.references.slice(0, 6).map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-btn border border-[var(--border)] p-2.5 transition hover:border-brand-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-brand-700 dark:text-brand-200">
                            {r.title}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          来源：{r.source}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="模拟面试"
            desc={mock ? `面试官人格：${mock.persona}` : "多轮对话 · 三维打分"}
          />
          <CardBody className="space-y-4">
            {!mock ? (
              <>
                <div className="flex items-center gap-3 rounded-card bg-brand-50 p-3 dark:bg-ink-800">
                  <img
                    src={mascotPose.think}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-btn bg-white object-contain shadow-card"
                  />
                  <p className="text-xs text-[var(--text-muted)]">
                    面试官会围绕你的简历追问，先想一想你的高光经历，准备好了就开始吧。
                  </p>
                </div>
                <div>
                  <Label>粘贴简历（用于定制追问，可选）</Label>
                  <Textarea
                    rows={4}
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="粘贴简历要点，AI 会据此追问…"
                  />
                </div>
                <Button variant="brand" loading={mockLoading} onClick={startMock}>
                  开始模拟面试
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {transcript.map((t, i) => (
                    <div
                      key={i}
                      className={`max-w-[85%] rounded-card px-3 py-2 text-sm ${
                        t.role === "interviewer"
                          ? "bg-ink-100 dark:bg-ink-800"
                          : "ml-auto bg-brand-600 text-white"
                      }`}
                    >
                      {t.content}
                    </div>
                  ))}
                </div>

                {mock.feedback && (
                  <div className="rounded-card border border-[var(--border)] bg-brand-50 p-3 text-sm dark:bg-ink-800">
                    <p className="mb-1 font-semibold text-brand-700 dark:text-brand-200">
                      上一题反馈
                    </p>
                    <div className="mb-2 flex gap-4 text-xs">
                      <span>结构 {mock.feedback.structure_score}</span>
                      <span>深度 {mock.feedback.depth_score}</span>
                      <span>表达 {mock.feedback.expression_score}</span>
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-[var(--text-muted)]">
                      {mock.feedback.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {mock.finished ? (
                  <Button variant="outline" onClick={() => setMock(null)}>
                    再来一轮
                  </Button>
                ) : (
                  <div className="flex items-end gap-2">
                    <Textarea
                      rows={2}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="输入你的回答…"
                      className="flex-1"
                    />
                    <Button variant="primary" loading={mockLoading} onClick={submitAnswer}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
