import { Bookmark, BookmarkCheck, ExternalLink, Search } from "lucide-react";
import * as React from "react";
import { experienceApi } from "@/api/endpoints";
import type { CollectedItem, ExperienceItem } from "@/api/types";
import { assets } from "@/assets";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Spinner } from "@/components/States";
import { TrackSwitcher } from "@/components/TrackSwitcher";
import { useTrackStore } from "@/store/track";
import { TRACKS } from "@/theme/tokens";

export default function ExperiencePage() {
  const { track, setTrack } = useTrackStore();
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<ExperienceItem[]>([]);
  const [collected, setCollected] = React.useState<CollectedItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showFav, setShowFav] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [list, fav] = await Promise.all([
        experienceApi.list(track, q),
        experienceApi.collected(),
      ]);
      setItems(list);
      setCollected(fav);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  React.useEffect(() => {
    load();
  }, [load]);

  const collectedUrls = new Set(collected.map((c) => c.url));

  const toggleCollect = async (item: ExperienceItem) => {
    const existing = collected.find((c) => c.url === item.url);
    if (existing) {
      await experienceApi.removeCollected(existing.id);
      setCollected((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const saved = await experienceApi.collect(item);
      setCollected((prev) => [saved, ...prev]);
    }
  };

  const display: ExperienceItem[] = showFav ? collected : items;

  return (
    <div>
      <PageHeader
        title="经验帖集合"
        subtitle="按方向聚合真实经验帖（每方向 50+ 条、多平台来源），均附原文链接，支持筛选、搜索与收藏。"
        persona="产运导师 Nova · 内容聚合"
        action={
          <img src={assets.heroExperience} alt="" className="hidden h-16 rounded-card sm:block" />
        }
      />

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <TrackSwitcher value={track} onChange={setTrack} />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowFav(false);
                    load();
                  }
                }}
                placeholder="搜索关键词，如：面经 / 秋招时间线"
                className="pl-9"
              />
            </div>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => {
                setShowFav(false);
                load();
              }}
            >
              搜索
            </Button>
            <Button
              variant={showFav ? "brand" : "outline"}
              onClick={() => setShowFav((v) => !v)}
            >
              <Bookmark className="h-4 w-4" /> 收藏({collected.length})
            </Button>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Spinner />
      ) : display.length === 0 ? (
        <EmptyState
          title={showFav ? "还没有收藏" : "暂无结果"}
          desc={showFav ? "点击卡片上的书签图标收藏" : "换个方向或关键词试试"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {display.map((item, i) => {
            const isFav = collectedUrls.has(item.url);
            return (
              <Card key={i} className="flex flex-col transition hover:shadow-float">
                <CardBody className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="muted">
                        {TRACKS.find((t) => t.key === item.track)?.label ?? "其他"}
                      </Badge>
                      <Badge tone="brand">{item.source}</Badge>
                    </div>
                    <button
                      onClick={() => toggleCollect(item)}
                      className="text-brand-500 hover:text-brand-700"
                      aria-label="收藏"
                    >
                      {isFav ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold leading-snug text-[var(--text)] hover:text-brand-700"
                  >
                    {item.title}
                  </a>
                  <p className="flex-1 text-sm text-[var(--text-muted)]">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                    <span>{item.author || "来源见原文"}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                    >
                      原文 <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
