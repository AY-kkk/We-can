import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { landingApi } from "@/api/endpoints";
import type { ChecklistItem, PolishMessageResult } from "@/api/types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Input, Label, Select, Textarea } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/States";

export default function LandingPage() {
  const [items, setItems] = React.useState<ChecklistItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState("");
  const [newCat, setNewCat] = React.useState("自定义");

  const load = async () => {
    setLoading(true);
    try {
      setItems(await landingApi.getChecklist());
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    load();
  }, []);

  const toggle = async (it: ChecklistItem) => {
    const updated = await landingApi.updateItem({ id: it.id, done: !it.done });
    setItems((prev) => prev.map((p) => (p.id === it.id ? updated : p)));
  };

  const add = async () => {
    if (!newTitle.trim()) return;
    const created = await landingApi.addItem({
      title: newTitle,
      category: newCat,
      is_custom: true,
    });
    setItems((prev) => [...prev, created]);
    setNewTitle("");
  };

  const remove = async (id: number) => {
    await landingApi.deleteItem(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, it) => {
    (acc[it.category] ||= []).push(it);
    return acc;
  }, {});
  const done = items.filter((i) => i.done).length;

  return (
    <div>
      <PageHeader
        title="秋招 Landing"
        subtitle="入职前材料清单一目了然，沟通话术一键润色，稳稳落地。"
        persona="高情商话术润色 · 沟通共赢"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="入职材料清单"
            desc={`已完成 ${done}/${items.length}`}
          />
          <CardBody className="space-y-5">
            {loading ? (
              <Spinner />
            ) : (
              <>
                {Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat}>
                    <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">
                      {cat}
                    </p>
                    <div className="space-y-1.5">
                      {list.map((it) => (
                        <label
                          key={it.id}
                          className="group flex cursor-pointer items-center gap-3 rounded-btn border border-[var(--border)] px-3 py-2 transition hover:border-brand-300"
                        >
                          <input
                            type="checkbox"
                            checked={it.done}
                            onChange={() => toggle(it)}
                            className="h-4 w-4 accent-brand-600"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              it.done
                                ? "text-[var(--text-muted)] line-through"
                                : "text-[var(--text)]"
                            }`}
                          >
                            {it.title}
                          </span>
                          {it.is_custom && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                remove(it.id);
                              }}
                              className="text-ink-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                              aria-label="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-end gap-2 border-t border-[var(--border)] pt-4">
                  <div className="w-28">
                    <Label>分类</Label>
                    <Input
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>新增自定义项</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && add()}
                      placeholder="如：办理落户预约"
                    />
                  </div>
                  <Button variant="brand" onClick={add}>
                    <Plus className="h-4 w-4" /> 添加
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <MessagePolisher />
      </div>
    </div>
  );
}

function MessagePolisher() {
  const [message, setMessage] = React.useState("");
  const [audience, setAudience] = React.useState("HR");
  const [scenario, setScenario] = React.useState("入职沟通");
  const [channel, setChannel] = React.useState("微信");
  const [result, setResult] = React.useState<PolishMessageResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  const polish = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      setResult(
        await landingApi.polishMessage({ message, audience, scenario, channel }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="沟通话术润色" desc="锚定目标 · 连接价值 · 温和/直接双版本" />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>沟通对象</Label>
            <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option>HR</option>
              <option>业务主管</option>
              <option>导师/学长</option>
              <option>同事</option>
            </Select>
          </div>
          <div>
            <Label>场景</Label>
            <Select value={scenario} onChange={(e) => setScenario(e.target.value)}>
              <option>入职沟通</option>
              <option>延期报到</option>
              <option>薪资确认</option>
              <option>婉拒 offer</option>
            </Select>
          </div>
          <div>
            <Label>渠道</Label>
            <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>微信</option>
              <option>邮件</option>
              <option>电话</option>
            </Select>
          </div>
        </div>
        <div>
          <Label>原始表达</Label>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入你想表达的原始内容…"
          />
        </div>
        <Button variant="primary" loading={loading} onClick={polish}>
          润色话术
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="grid gap-2 rounded-btn bg-ink-50 p-3 text-xs text-[var(--text-muted)] dark:bg-ink-800">
              <p>🎯 目标锚定：{result.goal_anchor}</p>
              <p>👤 对方价值：{result.audience_value}</p>
              <p>🤝 利益连接：{result.interest_link}</p>
            </div>
            {result.versions.map((v) => (
              <div
                key={v.tone}
                className="rounded-card border border-[var(--border)] p-3"
              >
                <Badge tone={v.tone === "温和版" ? "brand" : "accent"}>
                  {v.tone}
                </Badge>
                <p className="mt-2 text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
            <p className="rounded-btn bg-brand-50 p-3 text-xs text-brand-700 dark:bg-ink-800 dark:text-brand-200">
              润色说明：{result.explanation}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
