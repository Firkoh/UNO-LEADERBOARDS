import { useState, useEffect } from 'react';
import supabase from "../../supabase";

function Count() {
  const getStoredState = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('uno_count_state');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Gagal memuat state dari localStorage', e);
      return null;
    }
  };

  const storedState = getStoredState();
  const [step, setStep] = useState(storedState?.step ?? 'count');
  const [players, setPlayers] = useState(storedState?.players ?? 2);
  const [games, setGames] = useState(storedState?.games ?? 1);
  const [names, setNames] = useState(storedState?.names ?? []);
  const [scores, setScores] = useState(storedState?.scores ?? []);
  const [currentIndex, setCurrentIndex] = useState(storedState?.currentIndex ?? 0);
  const [currentName, setCurrentName] = useState(storedState?.currentName ?? '');

  const startInput = async () => {
    try {
      const { data: dbPlayers, error } = await supabase
        .from("players")
        .select("name,score")
        .order("name", { ascending: true })
        .limit(players);

      if (error) {
        console.error("Gagal memuat pemain dari database:", error.message);
      }

      const nextNames = Array(players).fill('');
      const nextScores = Array(players).fill(0);

      if (dbPlayers && dbPlayers.length > 0) {
        dbPlayers.slice(0, players).forEach((player, idx) => {
          nextNames[idx] = player.name || '';
          nextScores[idx] = player.score ?? 0;
        });
      }

      setNames(nextNames);
      setScores(nextScores);
      setCurrentIndex(0);
      setCurrentName(nextNames[0] || '');
      setStep('names');
    } catch (error) {
      console.error("Gagal memulai input dari database:", error);
      setNames(Array(players).fill(''));
      setScores(Array(players).fill(0));
      setCurrentIndex(0);
      setCurrentName('');
      setStep('names');
    }
  };

  const savePlayersToDB = async (playerNames) => {
    try {
      // Fetch existing players to avoid overwriting their scores
      const { data: existing, error: fetchErr } = await supabase
        .from('players')
        .select('name')
        .in('name', playerNames);

      if (fetchErr) {
        console.error('Gagal memeriksa pemain existing:', fetchErr.message);
        return;
      }

      const existingNames = new Set((existing || []).map((r) => r.name));

      // Insert only new players with initial score 0
      const rowsToInsert = playerNames
        .filter((name) => !existingNames.has(name) && name.trim() !== '')
        .map((name) => ({ name, score: 0, "Jumlah Permainan": 0 }));

      if (rowsToInsert.length === 0) return;

      const { error: insertErr } = await supabase
        .from('players')
        .insert(rowsToInsert);

      if (insertErr) console.error('Gagal menyimpan pemain baru:', insertErr.message);
    } catch (e) {
      console.error('Gagal menyimpan pemain:', e);
    }
  };

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('uno_count_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.players !== undefined) setPlayers(parsed.players);
        if (parsed.games !== undefined) setGames(parsed.games);
        if (parsed.names && parsed.names.length > 0) setNames(parsed.names);
        if (parsed.scores && parsed.scores.length > 0) setScores(parsed.scores);
        if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex);
        if (parsed.currentName !== undefined) setCurrentName(parsed.currentName);
        if (parsed.step) setStep(parsed.step);
      }
    } catch (e) {
      console.error('Gagal memuat state dari localStorage', e);
    }
  }, []);

  // Persist relevant state to localStorage so refresh or "mulai ulang" won't clear
  useEffect(() => {
    try {
      const payload = {
        players,
        games,
        names,
        scores,
        currentIndex,
        currentName,
        step,
      };
      localStorage.setItem('uno_count_state', JSON.stringify(payload));
    } catch (e) {
      console.error('Gagal menyimpan state ke localStorage', e);
    }
  }, [players, names, scores, currentIndex, currentName, step]);

  const handleNext = async () => {
    const nextNames = [...names];
    const currentPlayerName =
      currentName.trim() || nextNames[currentIndex] || `Pemain ${currentIndex + 1}`;
    nextNames[currentIndex] = currentPlayerName;
    setNames(nextNames);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= players) {
      await savePlayersToDB(nextNames);
      setStep('done');
      setCurrentIndex(players);
      setCurrentName('');
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentName(nextNames[nextIndex] || '');
  };

  const handleAddScore = async (index, amount) => {
    const playerName = (names[index] || `Pemain ${index + 1}`).trim();
    let currentScore = scores[index] ?? 0;
    let currentGames = 0;

    try {
      const { data: dbPlayer, error: fetchErr } = await supabase
        .from("players")
        .select('score, "Jumlah Permainan"')
        .eq("name", playerName)
        .maybeSingle();

      if (!fetchErr && dbPlayer) {
        if (dbPlayer.score !== undefined) currentScore = dbPlayer.score;
        if (dbPlayer["Jumlah Permainan"] !== undefined) currentGames = dbPlayer["Jumlah Permainan"];
      }
    } catch (fetchError) {
      console.error("Gagal memuat skor dari database:", fetchError.message);
    }

    const nextScore = currentScore + amount;
    setScores((prev) => {
      const next = [...prev];
      next[index] = nextScore;
      return next;
    });

    const { error } = await supabase
      .from("players")
      .upsert({ name: playerName, score: nextScore }, { onConflict: "name" });

    if (error) console.error("Gagal update skor:", error.message);

if (amount >= 0) {
  const { error: gamesError } = await supabase
    .from("players")
    .update({
      "Jumlah Permainan": currentGames + 1,
    })
    .eq("name", playerName);

  if (gamesError) {
    console.error("Gagal update Jumlah Permainan:", gamesError.message);
  }
}
  };

  const scoreOptions = (() => {
    let positives;
    if (players === 2) positives = [0, 2];
    else if (players === 3) positives = [0, 1, 2];
    else positives = [0, ...Array.from({ length: Math.max(0, players - 1) }, (_, i) => 2 * (i + 1))];

    const negMap = { 2: -3, 3: -4, 4: -5, 5: -6, 7: -10 };
    const negative = negMap[players];

    if (negative !== undefined) return [negative, ...positives];
    return positives;
  })();

  const resetAll = async () => {
    setStep('count');
    setCurrentIndex(0);
    setCurrentName('');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('uno_count_state');
      setStep('count');
      setPlayers(2);
      setGames(1);
      setNames([]);
      setScores([]);
      setCurrentIndex(0);
      setCurrentName('');
    } catch (e) {
      console.error('Gagal logout:', e);
    }
  };

  const handleRestartGame = async () => {
    // 1️⃣ Reset skor di database Supabase
    const { error } = await supabase
      .from("players")
      .update({ score: 0 })
      .neq("score", 0);

    if (error) {
      console.error("Gagal reset skor:", error.message);
      return;
    }

    // 2️⃣ Muat ulang data dari Supabase
    const { data, error: fetchError } = await supabase
      .from("players")
      .select("name, score")
      .order("score", { ascending: false });

    if (fetchError) {
      console.error("Gagal ambil data:", fetchError.message);
      return;
    }

    // 3️⃣ Reset state React
    const playersData = data || [];
    setNames(playersData.map((p) => p.name));
    setScores(playersData.map((p) => p.score));
    setStep("done");
  };

  const deleteAllPlayers = async () => {
    const { error } = await supabase
      .from("players")
      .delete()
      .neq("id", -1);

    if (error) console.log(error);
  };

  return (
    <div draggable="false" className="min-h-screen bg-linear-to-br from-[#0a1f44] to-[#1a2a6c] px-4 py-10 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Masukkan nama pemain satu per satu</h2>

        {step === 'count' && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-base font-medium text-slate-700">
            Berapa jumlah pemain?
            <select
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </label>
          <div className="mt-3">
            <button
              type="button"
              onClick={startInput}
              className="inline-flex items-center justify-center rounded-xl bg-yellow-600 px-4 py-2 text-white transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Mulai
            </button>
          </div>
        </div>
      )}

      {step === 'names' && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-lg font-medium text-slate-800">Pemain ke-{currentIndex + 1}</p>
          <input
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            placeholder={`Nama pemain ${currentIndex + 1}`}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-slate-800">Daftar pemain dan skor</h3>
          {names.map((playerName, i) => (
            <div key={playerName || i} className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-base text-slate-800 flex items-center justify-between">
                <span>{i + 1}. {playerName || `Pemain ${i + 1}`}</span>
                <div className="flex items-center gap-2">
                  {(scores[i] ?? 0) < 0 ? (
                    <span className="text-red-400 font-bold">❌</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">{"⭐".repeat(Math.max(0, Math.min(Math.floor((scores[i] ?? 0) / 500), 5)))}</span>
                  )}
                  <span className="text-yellow-300 font-semibold">{scores[i] ?? 0}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {scoreOptions
                  .filter((amount) => amount !== 0)
                  .map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAddScore(i, amount)}
                      className="rounded-xl bg-yellow-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {amount > 0 ? `Tambah +${amount}` : `Kurangi ${amount}`}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => handleAddScore(i, 0)}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                 Kalah
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data: dbPlayers, error } = await supabase
                    .from("players")
                    .select("name,score")
                    .in("name", names.filter((n) => n.trim() !== ""));

                  if (!error && dbPlayers) {
                    const playerScores = {};
                    dbPlayers.forEach((p) => {
                      playerScores[p.name] = p.score ?? 0;
                    });

                    const updatedScores = names.map((name, i) => playerScores[name] ?? scores[i] ?? 0);
                    setScores(updatedScores);
                  }
                } catch (e) {
                  console.error("Gagal memuat skor dari database:", e);
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Muat ulang skor
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-4 py-2 text-slate-900 transition hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Mulai ulang
            </button>
          </div>
        </div>
      )}
    
      </div>
    </div>
  );
}

export default Count;
