import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import supabase from "../../supabase";

function Count() {

const [step, setStep] = useState("count");
const [players, setPlayers] = useState(2);
const [games, setGames] = useState(1);
const [names, setNames] = useState([]);
const [scores, setScores] = useState([]);
const [gamesPlayed, setGamesPlayed] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [currentName, setCurrentName] = useState("");


const syncPlayers = async () => {
  const { data, error } = await supabase
    .from("players")
    .select('name, score, "Jumlah Permainan"')
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setNames(data.map((p) => p.name));
  setScores(data.map((p) => p.score));
  setGamesPlayed(data.map((p) => p["Jumlah Permainan"] ?? 0));
};

  const startInput = async () => {
    try {
      const selectedPlayers = Number(players) || 2;
      const { data: dbPlayers, error } = await supabase
        .from("players")
        .select("name,score")
        .order("name", { ascending: true })
        .limit(selectedPlayers);

      if (error) {
        console.error("Gagal memuat pemain dari database:", error.message);
      }

      const nextNames = Array(selectedPlayers).fill('');
      const nextScores = Array(selectedPlayers).fill(0);
      const nextGames = Array(selectedPlayers).fill(0);

      if (dbPlayers && dbPlayers.length > 0) {
        dbPlayers.slice(0, selectedPlayers).forEach((player, idx) => {
          nextNames[idx] = player.name || '';
          nextScores[idx] = player.score ?? 0;
          nextGames[idx] = player["Jumlah Permainan"] ?? 0;
        });
      }

      setNames(nextNames);
      setScores(nextScores);
      setGamesPlayed(nextGames);
      setCurrentIndex(0);
      setCurrentName(nextNames[0] || '');
      setStep('names');
    } catch (error) {
      console.error("Gagal memulai input dari database:", error);
      const selectedPlayers = Number(players) || 2;
      setNames(Array(selectedPlayers).fill(''));
      setScores(Array(selectedPlayers).fill(0));
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
  useEffect(() => {
  const channel = supabase.channel("players-admin");

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "players",
    },
    () => {
      if (step === "done") {
        fetchPlayers();
      }
    }
  );

  channel.subscribe();

  return () => channel.unsubscribe();
}, [step]);

const fetchPlayers = async () => {
  const { data, error } = await supabase
    .from("players")
    .select('name, score, "Jumlah Permainan"')
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setNames(data.map((p) => p.name));
  setScores(data.map((p) => p.score));
  setGamesPlayed(data.map((p) => p["Jumlah Permainan"] ?? 0));
  setPlayers(data.length);
};

  const handleNext = async () => {
    const nextNames = [...names];
    const currentPlayerName =
      currentName.trim() || nextNames[currentIndex] || `Pemain ${currentIndex + 1}`;
    nextNames[currentIndex] = currentPlayerName;
    setNames(nextNames);


    const nextIndex = currentIndex + 1;
    if (nextIndex >= players) {
     await savePlayersToDB(nextNames);
   await fetchPlayers();
setStep("done");
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
    const nextGames = amount >= 0 ? currentGames + 1 : currentGames;

    let actionTitle = "";
    let actionMessage = "";
    
    if (amount > 0) {
      actionTitle = "Tambah Skor";
      actionMessage = `Tambah ${amount} poin untuk ${playerName}?`;
    } else if (amount < 0) {
      actionTitle = "Kurangi Skor";
      actionMessage = `Kurangi ${Math.abs(amount)} poin untuk ${playerName}?`;
    } else {
      actionTitle = "Kalah";
      actionMessage = `Tandai ${playerName} kalah?`;
    }

    const result = await Swal.fire({
      title: actionTitle,
      text: actionMessage,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#fbbf24",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setScores((prev) => {
      const next = [...prev];
      next[index] = nextScore;
      return next;
    });
    setGamesPlayed((prev) => {
      const next = [...prev];
      next[index] = nextGames;
      return next;
    });

    const { error } = await supabase
      .from("players")
      .upsert({ name: playerName, score: nextScore }, { onConflict: "name" });

    if (error) {
      console.error("Gagal update skor:", error.message);
      Swal.fire("Error", "Gagal update skor", "error");
      return;
    }

    if (amount >= 0) {
      const { error: gamesError } = await supabase
        .from("players")
        .update({
          "Jumlah Permainan": nextGames,
        })
        .eq("name", playerName);

      if (gamesError) {
        console.error("Gagal update Jumlah Permainan:", gamesError.message);
      }
    }

    Swal.fire({
      title: "Berhasil",
      text: `Skor ${playerName} berhasil diperbarui`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  };

  const scoreOptions = (() => {
    const playerCount = Math.max(2, names.length, Number(players) || 2);
    const negMap = { 2: -3,3:-4, 4: -5, 5: -6, 7: -10 };
    const negative = negMap[playerCount];

    let positives;
    if (playerCount === 2) positives = [2];
    else if (playerCount === 3) positives = [4, 2];
    else positives = Array.from({ length: Math.max(0, playerCount - 1) }, (_, i) => 2 * (i + 1));

    if (negative !== undefined) return [negative, ...positives];
    return positives;
  })();

  const resetAll = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin memulai ulang? Semua input saat ini akan dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fbbf24",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, mulai ulang",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setStep('count');
    setCurrentIndex(0);
    setCurrentName('');
  };

 const handleLogout = () => {
  setStep("count");
  setPlayers(2);
  setGames(1);
  setNames([]);
  setScores([]);
  setCurrentIndex(0);
  setCurrentName("");
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
    setPlayers(playersData.length);
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
      <div className="mx-auto w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-300 sm:text-3xl">Masukkan nama pemain satu per satu</h2>

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
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-yellow-600 px-4 py-2 text-white transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
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
            <div key={`${i}-${playerName}`} className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="mb-3 text-base text-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{i + 1}. {playerName || `Pemain ${i + 1}`}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {(scores[i] ?? 0) < 0 ? (
                    <span className="text-red-400 font-bold">❌</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">{"⭐".repeat(Math.max(0, Math.min(Math.floor((scores[i] ?? 0) / 500), 5)))}</span>
                  )}
                  <span className="text-gray-700 font-semibold">Skor:{scores[i] ?? 0}</span>
                  <span className="text-gray-700 font-semibold">Permainan:{gamesPlayed[i] ?? 0}</span>
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
                      className="w-full sm:w-auto rounded-xl bg-yellow-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {amount > 0 ? `Tambah +${amount}` : `Kurangi ${amount}`}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => handleAddScore(i, 0)}
                  className="w-full sm:w-auto rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                 Kalah
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data: dbPlayers, error } = await supabase
                    .from("players")
                    .select('name, score, "Jumlah Permainan"')
                    .in("name", names.filter((n) => n.trim() !== ""));

                  if (!error && dbPlayers) {
                    const playerScores = {};
                    const playerGames = {};
                    dbPlayers.forEach((p) => {
                      playerScores[p.name] = p.score ?? 0;
                      playerGames[p.name] = p["Jumlah Permainan"] ?? 0;
                    });

                    const updatedScores = names.map((name, i) => playerScores[name] ?? scores[i] ?? 0);
                    const updatedGames = names.map((name, i) => playerGames[name] ?? gamesPlayed[i] ?? 0);
                    setScores(updatedScores);
                    setGamesPlayed(updatedGames);
                  }
                } catch (e) {
                  console.error("Gagal memuat skor dari database:", e);
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Muat ulang skor
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-200 px-4 py-2 text-slate-900 transition hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
