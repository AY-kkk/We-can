import { Download, FileText, Sparkles } from "lucide-react";
import * as React from "react";
import { useReactToPrint } from "react-to-print";
import { resumeApi } from "@/api/endpoints";
import type { IntroResult, PolishResult } from "@/api/types";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Label, Textarea } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { columnHero } from "@/assets";
import { ErrorState, Spinner } from "@/components/States";
import { Upload } from "@/components/Upload";
import { toast } from "@/store/toast";

export default function ResumePage() {
  const [resumeText, setResumeText] = React.useState("");
  const [jd, setJd] = React.useState("");
  const [polish, setPolish] = React.useState<PolishResult | null>(null);
  const [intro, setIntro] = React.useState<IntroResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const onUpload = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const parsed = await resumeApi.parse(file);
      setResumeText(parsed.raw_text);
      toast.success("简历解析成功");
    } catch (e) {
      setError((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onPolish = async () => {
    if (!resumeText.trim()) {
      setError("请先上传简历或粘贴简历文本");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const [p, i] = await Promise.all([
        resumeApi.polish(resumeText, jd),
        resumeApi.intro(resumeText, jd),
      ]);
      setPolish(p);
      setIntro(i);
      toast.success("润色完成");
    } catch (e) {
      setError((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onExport = async () => {
    if (!polish) return;
    try {
      const blob = await resumeApi.exportPdf(polish.resume_html);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: 前端打印导出
      toast.info("服务端导出不可用，改用浏览器打印导出");
      handlePrint();
    }
  };

  return (
    <div>
      <PageHeader
        title="简历打磨"
        subtitle="上传简历与目标 JD，按 STAR 法则逐条润色并量化成果，生成 A4 简历与三份自我介绍。"
        persona="全栈大师 / 前端设计师"
        action={
          <img src={columnHero.resume} alt="" className="hidden h-16 rounded-card shadow-card sm:block" />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左侧：输入 */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="① 上传简历" desc="支持 PDF / DOCX / TXT / Markdown" />
            <CardBody className="space-y-4">
              <Upload accept=".pdf,.docx,.doc,.txt,.md" onFile={onUpload} />
              <div>
                <Label>或直接粘贴简历文本</Label>
                <Textarea
                  rows={7}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="粘贴你的简历内容…"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="② 目标岗位 JD" desc="粘贴 JD 文本或链接，用于对齐润色方向" />
            <CardBody className="space-y-4">
              <Textarea
                rows={5}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="粘贴目标岗位的职位描述…"
              />
              <Button variant="primary" loading={loading} onClick={onPolish}>
                <Sparkles className="h-4 w-4" /> 一键润色
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* 右侧：结果 */}
        <div className="space-y-6">
          {error && (
            <Card>
              <ErrorState message={error} onRetry={onPolish} />
            </Card>
          )}
          {loading && !polish && (
            <Card>
              <Spinner label="正在润色简历" />
            </Card>
          )}

          {polish && (
            <Card>
              <CardHeader
                title="STAR 润色结果"
                desc="原文 → 润色对比"
                action={
                  <Button size="sm" variant="brand" onClick={onExport}>
                    <Download className="h-4 w-4" /> 导出 PDF
                  </Button>
                }
              />
              <CardBody className="space-y-4">
                {polish.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 rounded-btn border border-[var(--border)] p-3 sm:grid-cols-2"
                  >
                    <div className="rounded bg-ink-50 p-2 text-sm text-[var(--text-muted)] dark:bg-ink-800">
                      <span className="mb-1 block text-xs font-semibold">原文</span>
                      {it.original}
                    </div>
                    <div className="rounded bg-brand-50 p-2 text-sm text-[var(--text)] dark:bg-brand-900/30">
                      <span className="mb-1 block text-xs font-semibold text-brand-700 dark:text-brand-200">
                        润色（STAR）
                      </span>
                      {it.polished}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {intro && (
            <Card>
              <CardHeader title="三份自我介绍" desc="可直接背诵" />
              <CardBody className="space-y-4">
                {(
                  [
                    ["5 分钟版", intro.five_min],
                    ["2 分钟版", intro.two_min],
                    ["1 分钟版", intro.one_min],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label}>
                    <p className="mb-1 text-sm font-semibold text-brand-700 dark:text-brand-200">
                      {label}
                    </p>
                    <p className="rounded-btn bg-ink-50 p-3 text-sm leading-relaxed dark:bg-ink-800">
                      {text}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {!polish && !loading && !error && (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center gap-2 py-10 text-center text-[var(--text-muted)]">
                  <FileText className="h-8 w-8 text-brand-400" />
                  <p className="text-sm">润色结果将显示在这里</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* 打印用隐藏容器（前端 react-to-print 兜底） */}
      <div className="hidden">
        <div ref={printRef}>
          {polish && (
            <div dangerouslySetInnerHTML={{ __html: polish.resume_html }} />
          )}
        </div>
      </div>
    </div>
  );
}
