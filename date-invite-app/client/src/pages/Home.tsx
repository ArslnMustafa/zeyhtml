import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const timeOptions = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"] as const;

const visitPageLabels = {
  1: "Ana sayfa",
  2: "Tarih ve saat seçimi",
  3: "Yemek ve içecek seçimi",
  4: "Randevu onayı",
} as const;

const foodOptions = [
  { id: "matcha", label: "Matcha", image: "/assets/matcha.png" },
  { id: "chocolate-cake", label: "Çikolatalı pasta ama çok çikolatalı", image: "/assets/chocolate-cake.png" },
  { id: "pizza", label: "Pizza", image: "/assets/pizza.png" },
  { id: "sushi", label: "Sushi", image: "/assets/sushi.png" },
  { id: "burger", label: "Burger", image: "/assets/burger.png" },
  { id: "surprise", label: "Sana bırakıyorum", image: "/assets/surprise.png" },
] as const;

const pageTransition = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
  transition: { duration: 0.36 },
};

function makeInitialDate() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  const latestDate = new Date(date.getFullYear(), 7, 30, 12, 0, 0, 0);
  return date > latestDate ? latestDate : date;
}

function AmbientDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Sparkles className="ambient-float ambient-float-one" />
      <Sparkles className="ambient-float ambient-float-two" />
      <Sparkles className="ambient-float ambient-float-three" />
      <Sparkles className="ambient-float ambient-float-four" />
      <span className="sand-orb sand-orb-one" />
      <span className="sand-orb sand-orb-two" />
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="mb-7 flex items-center justify-center gap-2" aria-label={`Adım ${step} / 4`}>
      {[1, 2, 3, 4].map(item => (
        <span key={item} className={cn("h-1.5 rounded-full transition-all duration-300", item === step ? "w-8 bg-[#895b45]" : item < step ? "w-1.5 bg-[#c5a27e]" : "w-1.5 bg-[#e1d3c2]")} />
      ))}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => makeInitialDate());
  const [selectedTime, setSelectedTime] = useState<(typeof timeOptions)[number]>("14:00");
  const [selectedFood, setSelectedFood] = useState<string[]>([]);
  const [noPosition, setNoPosition] = useState({ x: 74, y: 51 });
  const noButtonAreaRef = useRef<HTMLDivElement>(null);
  const dateRequestMutation = trpc.dateRequest.submit.useMutation({
    onSuccess: () => setStep(4),
  });
  const visitMutation = trpc.visit.track.useMutation();

  useEffect(() => {
    visitMutation.mutate({ page: visitPageLabels[step as keyof typeof visitPageLabels] });
  }, [step]);

  const readableDate = useMemo(
    () => selectedDate ? format(selectedDate, "d MMMM, EEEE", { locale: tr }) : "tarihini",
    [selectedDate]
  );

  const dodgeNoButton = () => {
    const container = noButtonAreaRef.current;
    if (!container) return;

    const nextX = 16 + Math.random() * 68;
    const nextY = 18 + Math.random() * 62;
    setNoPosition({ x: nextX, y: nextY });
  };

  const toggleFood = (id: string) => {
    setSelectedFood(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const submitDateRequest = () => {
    if (!selectedDate || selectedFood.length === 0) return;

    dateRequestMutation.mutate({
      selectedDate: format(selectedDate, "yyyy-MM-dd"),
      selectedTime,
      selections: selectedFood.map(item => foodOptions.find(option => option.id === item)?.label).filter((label): label is "Matcha" | "Pizza" | "Sushi" | "Burger" | "Sana bırakıyorum" | "Çikolatalı pasta ama çok çikolatalı" => Boolean(label)),
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4eee4] text-[#4d392d]">
      <AmbientDecor />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-9">
        {step > 1 && step < 4 && (
          <header className="flex min-h-9 items-center justify-end">
            <button type="button" onClick={() => setStep(current => current - 1)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#79513d] transition hover:bg-[#fbf7f0]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78d68]">
              <ArrowLeft className="size-4" /> Geri
            </button>
          </header>
        )}

        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="intro" {...pageTransition} className="w-full max-w-2xl text-center">
                <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-[2rem] bg-[#eadfcd] text-[#895b45] shadow-[0_18px_45px_rgba(106,74,51,0.12)] ring-1 ring-[#ddcbb4]">
                  <Sparkles className="size-9 heart-pulse" />
                </div>
                <h1 className="font-display text-5xl leading-[0.94] tracking-tight text-[#4d392d] sm:text-7xl">Sınavlar bittiğine göre,<br />kafa dağıtmaya ne dersin?</h1>
                <div ref={noButtonAreaRef} className="relative mx-auto mt-10 h-40 w-full max-w-md sm:h-32">
                  <Button onClick={() => setStep(2)} className="absolute left-[28%] top-1/2 min-w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#895b45] px-7 py-6 text-base font-semibold text-white shadow-[0_14px_28px_rgba(107,69,49,0.24)] transition duration-200 hover:bg-[#704735] active:scale-[0.97]">
                    Evet
                  </Button>
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    onPointerEnter={dodgeNoButton}
                    onPointerDown={event => { event.preventDefault(); dodgeNoButton(); }}
                    onClick={event => { event.preventDefault(); dodgeNoButton(); }}
                    style={{ left: `${noPosition.x}%`, top: `${noPosition.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4baa3] bg-[#fbf7f0]/85 px-6 py-3 text-sm font-semibold text-[#7c5945] shadow-sm transition-[left,top,transform] duration-200 ease-out hover:scale-105"
                  >
                    Hayır
                  </button>
                </div>
                <p className="mt-3 text-xs text-[#9a806d]">İpucu: “Hayır” biraz utangaç.</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="schedule" {...pageTransition} className="w-full max-w-5xl">
                <StepDots step={2} />
                <div className="grid overflow-hidden rounded-[2rem] bg-[#fbf7f0]/90 shadow-[0_28px_80px_rgba(104,70,51,0.13)] ring-1 ring-[#eadfce] backdrop-blur sm:grid-cols-[1.05fr_0.95fr]">
                  <div className="p-6 sm:p-9">
                    <div className="mb-5 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#eadfcd] text-[#895b45]"><CalendarDays className="size-5" /></span><div><p className="font-display text-2xl text-[#4d392d]">Bir gün seçelim</p><p className="text-sm text-[#796352]">Takvimden uygun bir tarih seç.</p></div></div>
                    <div className="rounded-2xl border border-[#e1d2bf] bg-[#fdfaf5] p-2 sm:p-3">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={[{ before: new Date() }, { after: new Date(new Date().getFullYear(), 7, 30, 23, 59, 59) }]} locale={tr} className="mx-auto" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between bg-[#ede1d1] p-6 sm:p-9">
                    <div>
                      <div className="mb-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#fbf7f0] text-[#895b45] shadow-sm"><Clock3 className="size-5" /></span><div><p className="font-display text-2xl text-[#4d392d]">Saat kaçta?</p><p className="text-sm text-[#796352]">Buluşma için bir saat belirle.</p></div></div>
                      <div className="grid grid-cols-2 gap-3">
                        {timeOptions.map(time => <button key={time} type="button" onClick={() => setSelectedTime(time)} className={cn("rounded-2xl border px-4 py-4 text-lg font-semibold transition duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78d68]", selectedTime === time ? "border-[#895b45] bg-[#895b45] text-white shadow-[0_10px_22px_rgba(104,70,51,0.20)]" : "border-[#d8c5af] bg-[#fbf7f0] text-[#674b3c] hover:border-[#b78d68]")}><span className="font-display text-2xl">{time}</span></button>)}
                      </div>
                    </div>
                    <div className="mt-8 rounded-2xl border border-[#d8c5af] bg-[#fbf7f0]/85 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7158]">Buluşma planı</p><p className="mt-1 font-display text-xl text-[#4d392d]">{readableDate} · {selectedTime}</p></div>
                    <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className="mt-5 w-full rounded-full bg-[#895b45] py-6 text-base font-semibold text-white hover:bg-[#704735]">Devam et <ChevronRight className="ml-1 size-5" /></Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="menu" {...pageTransition} className="w-full max-w-6xl">
                <StepDots step={3} />
                <div className="mb-7 text-center"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a7158]">en güzel kısmı</p><h2 className="mt-2 font-display text-4xl tracking-tight text-[#4d392d] sm:text-5xl">Ne yiyelim, ne içelim?</h2><p className="mt-3 text-[#796352]">Birden fazla seçebilirsin.</p></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {foodOptions.map(option => {
                    const isSelected = selectedFood.includes(option.id);
                    return <button key={option.id} type="button" aria-pressed={isSelected} onClick={() => toggleFood(option.id)} className={cn("group relative aspect-[4/4.7] overflow-hidden rounded-[1.5rem] border border-[#deccb6] bg-[#d5bea3] text-left shadow-[0_12px_26px_rgba(104,70,51,0.14)] ring-2 transition duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[#895b45]", isSelected ? "ring-[#895b45]" : "ring-[#f7f0e7] hover:-translate-y-1 hover:ring-[#b78d68]")}>
                      <img src={option.image} alt="" className="absolute inset-0 size-full object-cover sepia-[0.24] saturate-[0.68] transition duration-500 group-hover:scale-110" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#3e2c22]/88 via-[#6e4b38]/23 to-[#d7bfa3]/12" />
                      {isSelected && <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-[#895b45] text-white shadow-md"><Check className="size-4" strokeWidth={3} /></span>}
                      <span className="absolute inset-x-0 bottom-0 p-4"><span className={cn("block font-display leading-none text-white drop-shadow-sm", option.id === "chocolate-cake" ? "text-lg leading-5" : "text-2xl")}>{option.label}</span></span>
                    </button>;
                  })}
                </div>
                <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-center text-sm text-[#796352] sm:text-left">{selectedFood.length === 0 ? "Seçim yapmayı unutma." : `${selectedFood.length} seçenek seçtin.`}</p><Button disabled={selectedFood.length === 0 || dateRequestMutation.isPending} onClick={submitDateRequest} className="rounded-full bg-[#895b45] px-7 py-6 text-base font-semibold text-white hover:bg-[#704735]">{dateRequestMutation.isPending ? "Kaydediliyor…" : "Planı onayla"}</Button></div>
                {dateRequestMutation.isError && <p className="mt-3 text-center text-sm font-medium text-[#9a493b]">Bir şeyler ters gitti. Lütfen tekrar dene.</p>}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="celebration" {...pageTransition} className="w-full max-w-2xl text-center">
                <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.38 }} className="font-display text-6xl tracking-tight text-[#4d392d] sm:text-8xl">Süper, anlaştık!</motion.h1>
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.38 }} className="mx-auto mt-5 max-w-lg font-display text-3xl leading-tight text-[#79513d] sm:text-4xl">{readableDate} saat {selectedTime}'de hazır ol. Seni almaya geleceğim.</motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.38 }} className="mx-auto mt-9 max-w-md rounded-[2rem] bg-[#fbf7f0]/95 p-6 text-left shadow-[0_22px_65px_rgba(104,70,51,0.13)] ring-1 ring-[#eadfce] backdrop-blur">
                  <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eadfcd] text-[#895b45]"><CalendarDays className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7158]">Randevu bilgileri</p><p className="mt-1 font-display text-2xl text-[#4d392d]">{readableDate}</p><p className="font-semibold text-[#79513d]">Saat {selectedTime}</p></div></div>
                  <div className="my-5 h-px bg-[#e5d8c7]" />
                  <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eadfcd] text-[#895b45]"><Sparkles className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7158]">Seçtiklerin</p><p className="mt-1 font-medium leading-6 text-[#674b3c]">{selectedFood.map(item => foodOptions.find(option => option.id === item)?.label).join(" · ")}</p></div></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
