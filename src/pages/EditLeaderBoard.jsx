import { useEffect, useState } from "react";
import supabase from "../../supabase";
import Swal from "sweetalert2";

export default function EditLeaderBoard() {
  const [players, setPlayers] = useState([]);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedScore, setEditedScore] = useState("");
  const [editedJumlahPermainan, setEditedJumlahPermainan] = useState("");

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("score", { ascending: false });
    if (error) console.error(error);
    else setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();

    const channel = supabase.channel("players-changes");

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players" },
      (payload) => {
        console.log("Realtime update:", payload);
        fetchPlayers();
      }
    );

    channel.subscribe();

    return () => {
      // properly unsubscribe realtime channel on cleanup
      channel.unsubscribe();
    };
  }, []);

  const startEditing = (player) => {
    setEditingPlayerId(String(player.id));
    setEditedName(player.name ?? "");
    setEditedScore(String(player.score ?? ""));
    setEditedJumlahPermainan(String(player["Jumlah Permainan"] ?? ""));
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
    setEditedName("");
    setEditedScore("");
    setEditedJumlahPermainan("");
  };

  const savePlayer = async (id) => {
    const idForDb = Number(id);
    const scoreValue = Number(editedScore);
    const gameCountValue = Number(editedJumlahPermainan);
    const updates = {
      name: editedName.trim(),
      score: Number.isNaN(scoreValue) ? 0 : scoreValue,
      "Jumlah Permainan": Number.isNaN(gameCountValue) ? 0 : gameCountValue,
    };

    const { data, error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", idForDb)
      .select();

    if (error) {
      console.error("Update failed:", error);
      return;
    }

    if (data && data.length > 0) {
      setPlayers((current) =>
        current.map((player) => (player.id === idForDb ? data[0] : player))
      );
    } else {
      fetchPlayers();
    }

    cancelEditing();
  };

  const deleteAllPlayers = async () => {
    const result = await Swal.fire({
      title: "Hapus seluruh pemain?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus semua",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    if (!players || players.length === 0) {
      setPlayers([]);
      cancelEditing();
      return;
    }

    const ids = players.map((p) => (typeof p.id === "number" ? p.id : Number(p.id)));
    const { error } = await supabase.from("players").delete().in("id", ids);
    if (error) {
      console.error("Delete all failed:", error);
      await Swal.fire({
        title: "Gagal menghapus semua pemain",
        text: error.message,
        icon: "error",
      });
      return;
    }
    setPlayers([]);
    cancelEditing();
  };

  return (
    <div className="flex flex-col items-center bg-linear-to-br from-[#FB6C00] to-[#F9B637] min-h-screen text-[#E73F1E] py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FFDD9C] rounded-2xl border border-blue-400 shadow-lg p-4 sm:p-6 w-full max-w-4xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left tracking-wide text-[#E73F1E]">
            LEADERBOARD
          </h1>
          <button
            className="rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-semibold hover:bg-red-400"
            onClick={deleteAllPlayers}
          >
            Hapus Semua
          </button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 text-[#E73F1E]">Belum ada Pemain</div>
        ) : (
          <ul className="space-y-4">
            {players.map((p, index) => (
              <li
                key={p.id}
                className="flex flex-col gap-4 bg-[#FFDD9C] rounded-xl px-3 sm:px-4 py-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {index === 0 && <span className="text-4xl">🥇</span>}
                    {index === 1 && <span className="text-3xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-lg font-semibold">{index + 1}</span>}

                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden">
                      <img src="users.png" alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <span className="font-semibold text-sm sm:text-base">{p.name}</span>
                      <div className="text-xs sm:text-sm text-[#E73F1E]">
                        Permainan Ke : {p["Jumlah Permainan"]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">Skor {p.score}</span>
                    <button
                      className="rounded-lg bg-green-800 text-[#F9B637] px-3 py-1 text-sm font-semibold hover:bg-[#E73F1E]"
                      onClick={() => startEditing(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg bg-red-500 text-white px-3 py-1 text-sm font-semibold hover:bg-red-400"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: `Hapus pemain ${p.name}?`,
                          text: "Tindakan ini tidak dapat dibatalkan.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Ya, hapus",
                          cancelButtonText: "Batal",
                        });
                        if (!result.isConfirmed) return;
                        const idForDb = Number(p.id) || p.id;
                        const { error } = await supabase.from("players").delete().eq("id", idForDb);
                        if (error) {
                          console.error("Delete failed:", error);
                          await Swal.fire({ title: "Gagal menghapus pemain", text: error.message, icon: "error" });
                        } else {
                          setPlayers((current) => current.filter((pl) => pl.id !== p.id));
                        }
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {String(editingPlayerId) === String(p.id) && (
                  <div className="rounded-xl bg-[#E73F1E] p-3 sm:p-4">
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Nama Pemain"
                        className="w-full rounded-xl border border-slate-600 bg-[#F9B637] px-3 py-2 text-[#E73F1E]"
                      />
                      <input
                        type="number"
                        value={editedScore}
                        onChange={(e) => setEditedScore(e.target.value)}
                        placeholder="Skor"
                        className="w-full rounded-xl border border-slate-600 bg-[#F9B637] px-3 py-2 text-[#E73F1E]"
                      />
                      <input
                        type="number"
                        value={editedJumlahPermainan}
                        onChange={(e) => setEditedJumlahPermainan(e.target.value)}
                        placeholder="Jumlah Permainan"
                        className="w-full rounded-xl border border-slate-600 bg-[#F9B637] px-3 py-2 text-[#E73F1E]"
                      />
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-white hover:bg-[#E73F1E]"
                        onClick={() => savePlayer(p.id)}
                      >
                        Simpan
                      </button>
                      <button
                        className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
                        onClick={cancelEditing}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
