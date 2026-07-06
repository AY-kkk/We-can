import { ExternalLink, Send } from "lucide-react";
import * as React from "react";
import { prepApi } from "@/api/endpoints";
import type { MockInterview, MockTurn, QuestionBank } from "@/api/types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Input, Label, Textarea } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Spinner } from "@/components/States";

export default function PrepPage() {
  const [role, setRole] = React.useState("产品经理");
  const [keyword, setKeyword] = React.useState("");
  const [resume, setResume] = React.useState("");
  const [bank, setBank] = React.useState<QuestionBank | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [mock, setMock] = React.useState<MockInterview | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [mockLoading, setMockLoading] = React.useState(false);

  const loadBank = async () => {
    setLoading(true);
    try {
      setBank(await prepApi.questionBank(role, keyword));
    } finally {
      setLoading(false);
    }
  };

  const startMock = async () => {
    setMockLoading(true);
    try {
      const res = await prepApi.mockInterview({ role, resume_text: resume });
      setMock(res);
    } finally {
      setMockLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!mock || !answer.trim()) return;
    setMockLoading(true);
    try {
      const res = await prepApi.mockInterview({
        role,
        resume_text: resume,
        session_id: mock.session_id,
        answer,
        history: mock.history,
      });
      setMock(res);
      setAnswer("");
    } finally {
      setMockLoading(false);
    }
  };

  const transcript: MockTurn[] = mock?.history ?? [];

  return (
    <div>
      <PageHeader
        title="笔面准备"
        subtitle="按目标岗位汇总题库与高频面试题，并进行多轮模拟面试与结构化打分。"
        persona="AI 产品导师 Echo / 产运导师 Nova"
      />

      <Card className="mb-6">
        <CardBody className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label>目标岗位</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="如：产品 / 运营 / 算法 / 前端 / 销售"
            />
          </div>
          <div>
            <Label>关键词（可选）</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="如：增长 / 数据分析"
            />
          </div>
          <Button variant="primary" loading={loading} onClick={loadBank}>
            生成题库
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="题库汇总" desc="笔试题型 + 高频面试题 + 参考来源" />
          <CardBody>
            {loading ? (
              <Spinner />
            ) : !bank ? (
              <EmptyState title="还没有题库" desc="填写岗位后点击「生成题库」" />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">笔试题型</p>
                  <div className="flex flex-wrap gap-2">
                    {bank.written_types.map((t) => (
                      <Badge key={t} tone="accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">高频面试题</p>
                  <ul className="space-y-1.5">
                    {bank.interview_questions.map((q, i) => (
                      <li
                        key={i}
                        className="rounded-btn bg-ink-50 px-3 py-2 text-sm dark:bg-ink-800"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">参考来源</p>
                  <div className="space-y-2">
                    {bank.references.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-btn border border-[var(--border)] p-3 transition hover:border-brand-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-brand-700 dark:text-brand-200">
                            {r.title}
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {r.summary}
                        </p>
                        <span className="mt-1 inline-block text-xs text-[var(--text-muted)]">
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
          <CardHeader title="模拟面试" desc="多轮对话 · AI 追问与打分" />
          <CardBody className="space-y-4">
            {!mock ? (
              <>
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
                      <span>内容 {mock.feedback.content_score}</span>
                      <span>结构 {mock.feedback.structure_score}</span>
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
                    <Button
                      variant="primary"
                      loading={mockLoading}
                      onClick={submitAnswer}
                    >
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
