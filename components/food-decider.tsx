"use client";

import Image from "next/image";
import { FormEvent, useMemo, useRef, useState } from "react";

import { FireworksCanvas } from "@/components/fireworks-canvas";
import { Toast, ToastState } from "@/components/toast";
import { useLocalFoods } from "@/hooks/use-local-foods";
import { createWheelGradient, defaultFoodItems, getWheelColor, normalizeFoodItems } from "@/lib/foods";
import { createRandomSpin } from "@/lib/spin";

const spinDuration = 4200;

type RecentPick = {
  food: string;
  timestamp: string;
};

export function FoodDecider() {
  const { foods, setFoods, resetFoods, isHydrated } = useLocalFoods();
  const [draftFoods, setDraftFoods] = useState<string[]>(defaultFoodItems);
  const [newFood, setNewFood] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState("");
  const [recentPicks, setRecentPicks] = useState<RecentPick[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  const activeFoods = isEditing ? draftFoods : foods;
  const wheelGradient = useMemo(() => createWheelGradient(activeFoods), [activeFoods]);

  const notify = (message: string, tone: NonNullable<ToastState>["tone"] = "info") => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    setToast({ message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const startEditing = () => {
    if (isSpinning) {
      return;
    }

    setDraftFoods([...foods]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftFoods([...foods]);
    setNewFood("");
    setIsEditing(false);
  };

  const saveEditing = () => {
    const normalized = normalizeFoodItems(draftFoods);
    setFoods(normalized);
    setDraftFoods(normalized);
    setNewFood("");
    setIsEditing(false);
    notify("菜单已保存到本地", "success");
  };

  const updateDraft = (index: number, value: string) => {
    setDraftFoods((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const removeDraft = (index: number) => {
    if (draftFoods.length <= 2) {
      notify("至少保留 2 个候选项", "warning");
      return;
    }

    setDraftFoods((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetDraftItem = (index: number) => {
    setDraftFoods((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? defaultFoodItems[index % defaultFoodItems.length] : item))
    );
  };

  const addFood = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newFood.trim();

    if (!value) {
      notify("先写一个菜名", "warning");
      return;
    }

    setDraftFoods((current) => [...current, value]);
    setNewFood("");
  };

  const applyPreset = (items: string[]) => {
    if (isSpinning) {
      return;
    }

    setDraftFoods(items);
    setIsEditing(true);
    notify("已装入一组灵感菜单，保存后生效", "info");
  };

  const spin = () => {
    if (isSpinning || foods.length === 0) {
      return;
    }

    setShowFireworks(false);
    setSelectedIndex(null);
    setSelectedFood("");
    setIsSpinning(true);

    const result = createRandomSpin(foods.length, rotation);
    setRotation(result.rotation);

    window.setTimeout(() => {
      const food = foods[result.selectedIndex];
      setSelectedIndex(result.selectedIndex);
      setSelectedFood(food);
      setRecentPicks((current) => [
        { food, timestamp: new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(new Date()) },
        ...current
      ].slice(0, 5));
      setIsSpinning(false);
      setShowFireworks(true);
      window.setTimeout(() => setShowFireworks(false), 6800);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play().catch(() => notify("浏览器拦截了音效播放", "warning"));
      }
    }, spinDuration);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8ec] text-[#211915]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(33,25,21,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(33,25,21,0.05)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute left-0 top-0 h-full w-2 bg-[#ff4b3f]" />
      <FireworksCanvas active={showFireworks} />
      <Toast toast={toast} />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-[#211915] pb-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#118ab2]">Neon Menu Spinner</p>
            <h1 className="font-display text-[clamp(2.4rem,8vw,6.7rem)] font-black leading-[0.9] text-[#211915]">
              今天吃什么？
            </h1>
          </div>
          <div className="max-w-xs border-4 border-[#211915] bg-[#ffd166] px-4 py-3 text-right shadow-ink">
            <p className="text-xs font-black uppercase">LOCAL MENU</p>
            <p className="text-2xl font-black">{isHydrated ? foods.length : "--"} 个候选</p>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(320px,1fr)_minmax(360px,460px)]">
          <section className="grid gap-5 xl:grid-cols-[minmax(340px,560px)_minmax(220px,1fr)]">
            <div className="flex min-h-[520px] flex-col items-center justify-center border-4 border-[#211915] bg-[#fefefe] p-5 shadow-ink">
              <div className="relative aspect-square w-full max-w-[520px]">
                <div className="absolute -top-4 left-1/2 z-20 h-14 w-10 -translate-x-1/2">
                  <div className="mx-auto h-0 w-0 border-l-[20px] border-r-[20px] border-t-[42px] border-l-transparent border-r-transparent border-t-[#ff4b3f] drop-shadow-[0_5px_0_rgba(33,25,21,0.24)]" />
                </div>

                <div
                  className="absolute inset-4 rounded-full border-[12px] border-[#211915] shadow-neon transition-transform"
                  style={{
                    background: wheelGradient,
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? `${spinDuration}ms` : "0ms",
                    transitionTimingFunction: "cubic-bezier(0.13, 0.76, 0.2, 1)"
                  }}
                >
                  {activeFoods.map((food, index) => (
                    <div
                      key={`${food}-${index}`}
                      className="absolute left-1/2 top-0 h-1/2 w-0 origin-bottom border-l-2 border-white/70"
                      style={{ transform: `rotate(${(360 / activeFoods.length) * index}deg)` }}
                    />
                  ))}
                  <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#211915] bg-[#fff8ec]" />
                </div>

                <button
                  type="button"
                  onClick={spin}
                  disabled={isSpinning || isEditing}
                  className="absolute left-1/2 top-1/2 z-30 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#211915] bg-[#ff4b3f] px-5 text-center text-lg font-black text-white shadow-ink transition hover:-translate-y-[54%] disabled:cursor-not-allowed disabled:bg-[#7c8794]"
                >
                  {isSpinning ? "开转" : isEditing ? "先保存" : "开吃"}
                </button>
              </div>

              <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#5d514a]">
                <span className="rounded-full border-2 border-[#211915] bg-[#fff8ec] px-3 py-1">旋转 4.2s</span>
                <span className="rounded-full border-2 border-[#211915] bg-[#fff8ec] px-3 py-1">本地保存</span>
                <span className="rounded-full border-2 border-[#211915] bg-[#fff8ec] px-3 py-1">烟花音效</span>
              </div>
            </div>

            <aside className="flex flex-col justify-between gap-5">
              <div className="border-4 border-[#211915] bg-[#211915] p-4 text-[#fff8ec] shadow-ink">
                <p className="text-sm font-black uppercase text-[#ffd166]">Tonight's Order</p>
                <div className="mt-4 min-h-40">
                  {selectedFood ? (
                    <div className="flex items-center gap-4">
                      <Image src="/man.png" width={92} height={92} alt="result mascot" className="rounded-full border-4 border-[#ffd166] bg-white" />
                      <div>
                        <p className="text-sm font-bold text-[#7bdff2]">man! 今天就吃</p>
                        <p className="break-words text-4xl font-black text-white">{selectedFood}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid min-h-32 place-items-center border-2 border-dashed border-[#fff8ec]/35 text-center text-sm text-[#fff8ec]/70">
                      按下开吃，今晚的菜单会在这里亮灯。
                    </div>
                  )}
                </div>
              </div>

              <div className="border-4 border-[#211915] bg-[#19b6a3] p-4 shadow-ink">
                <p className="text-sm font-black uppercase">Recent Picks</p>
                <div className="mt-3 grid gap-2">
                  {recentPicks.length === 0 ? (
                    <p className="text-sm font-bold text-[#124c44]">还没有历史结果。</p>
                  ) : (
                    recentPicks.map((pick, index) => (
                      <div key={`${pick.food}-${pick.timestamp}-${index}`} className="flex justify-between border-2 border-[#211915] bg-[#fff8ec] px-3 py-2 text-sm font-black">
                        <span>{pick.food}</span>
                        <span>{pick.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </section>

          <section className="flex min-h-[520px] flex-col border-4 border-[#211915] bg-[#fefefe] shadow-ink">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#211915] bg-[#ffd166] px-4 py-3">
              <div>
                <h2 className="text-2xl font-black">候选菜牌</h2>
                <p className="text-sm font-bold text-[#5d514a]">{isEditing ? "编辑后保存才会参与抽签" : "抽中的菜会自动高亮"}</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button type="button" onClick={cancelEditing} className="border-2 border-[#211915] bg-white px-3 py-2 text-sm font-black">
                      取消
                    </button>
                    <button type="button" onClick={saveEditing} className="border-2 border-[#211915] bg-[#ff4b3f] px-3 py-2 text-sm font-black text-white">
                      保存
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={startEditing} disabled={isSpinning} className="border-2 border-[#211915] bg-[#211915] px-3 py-2 text-sm font-black text-white disabled:bg-[#7c8794]">
                    编辑菜单
                  </button>
                )}
              </div>
            </div>

            <div className="grid flex-1 content-start gap-3 overflow-auto p-4">
              {activeFoods.map((food, index) => (
                <div
                  key={`${food}-${index}`}
                  className={`grid grid-cols-[20px_1fr_auto] items-center gap-3 border-2 border-[#211915] px-3 py-2 ${
                    selectedIndex === index && !isEditing ? "bg-[#ff4b3f] text-white" : "bg-[#fff8ec]"
                  }`}
                >
                  <span className="h-5 w-5 rounded-sm border-2 border-[#211915]" style={{ backgroundColor: getWheelColor(index) }} />
                  {isEditing ? (
                    <input
                      value={food}
                      onChange={(event) => updateDraft(index, event.target.value)}
                      className="min-w-0 border-2 border-[#211915] bg-white px-2 py-1 text-sm font-bold outline-none focus:bg-[#e9f8ff]"
                      aria-label={`候选食物 ${index + 1}`}
                    />
                  ) : (
                    <span className="min-w-0 truncate text-base font-black">{food}</span>
                  )}
                  {isEditing ? (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => resetDraftItem(index)} className="h-8 w-8 border-2 border-[#211915] bg-white text-sm font-black" title="恢复默认">
                        ↺
                      </button>
                      <button type="button" onClick={() => removeDraft(index)} className="h-8 w-8 border-2 border-[#211915] bg-[#211915] text-sm font-black text-white" title="删除">
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-black opacity-70">#{index + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {isEditing ? (
              <div className="border-t-4 border-[#211915] p-4">
                <form onSubmit={addFood} className="flex gap-2">
                  <input
                    value={newFood}
                    onChange={(event) => setNewFood(event.target.value)}
                    placeholder="加一道新菜"
                    className="min-w-0 flex-1 border-2 border-[#211915] px-3 py-2 font-bold outline-none focus:bg-[#e9f8ff]"
                  />
                  <button type="submit" className="border-2 border-[#211915] bg-[#19b6a3] px-4 py-2 font-black">
                    添加
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => {
                    resetFoods();
                    setDraftFoods(defaultFoodItems);
                  }}
                  className="mt-3 w-full border-2 border-[#211915] bg-white px-4 py-2 text-sm font-black"
                >
                  恢复默认菜单
                </button>
              </div>
            ) : (
              <div className="grid gap-2 border-t-4 border-[#211915] p-4 sm:grid-cols-3">
                <button type="button" onClick={() => applyPreset(["麻辣烫", "冒菜", "酸辣粉", "火锅", "烧烤", "螺蛳粉"])} className="border-2 border-[#211915] bg-[#fff8ec] px-3 py-2 text-sm font-black">
                  辣一点
                </button>
                <button type="button" onClick={() => applyPreset(["沙拉", "寿司", "三明治", "越南粉", "轻食碗", "鸡胸饭"])} className="border-2 border-[#211915] bg-[#fff8ec] px-3 py-2 text-sm font-black">
                  清爽点
                </button>
                <button type="button" onClick={() => applyPreset(["烤肉", "披萨", "炸鸡", "汉堡", "烧烤", "牛排"])} className="border-2 border-[#211915] bg-[#fff8ec] px-3 py-2 text-sm font-black">
                  放纵点
                </button>
              </div>
            )}
          </section>
        </div>
      </section>

      <audio ref={audioRef} src="/man.mp3" preload="auto" />
    </main>
  );
}
