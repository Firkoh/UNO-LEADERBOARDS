// ...existing code...
import { useEffect, useState } from "react";
import supabase  from "../../supabase";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // ambil data awal
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("score", { ascending: false });
      if (error) console.error(error);
      else setPlayers(data);
    };
    fetchPlayers();

    // subscribe ke perubahan realtime
    const channel = supabase
      .channel("players-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchPlayers(); // refresh data setiap ada perubahan
        }
      );

    // subscribe (async) dan simpan reference
    channel.subscribe();

    // cleanup saat komponen unmount
    return () => {
      try {
        // gunakan unsubscribe pada channel
        channel.unsubscribe();
      } catch (e) {
        console.error("Failed to unsubscribe channel", e);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-linear-to-br from-[#0a1f44] to-[#1b2a6b] min-h-screen text-white p-6">
      <div className="bg-[#142b5f] rounded-2xl border border-blue-400 shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 tracking-wide text-cyan-300">
          LEADERBOARD
        </h1>

        {/* Jika tidak ada data tampilkan pesan */}
        {players.length === 0 ? (
          <div className="text-center py-8 text-cyan-200">Belum ada Pemain</div>
        ) : (
          <ul className="space-y-4">
            {players.map((p, index) => (
              <li
                key={p.id}
                className="flex items-center justify-between bg-[#1e3a8a] rounded-xl px-4 py-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  {/* Medali untuk 3 besar */}
                  {index === 0 && <span className="text-4xl">🥇</span>}
                  {index === 1 && <span className="text-3xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  {index > 2 && <span className="text-lg font-semibold">{index + 1}</span>}

                  {/* Avatar */}
                  <div className="w-10 h-10rounded-full">
                    <img src="users.png" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  </div>

                  {/* Nama pemain */}
                  <div>
                    <span className="font-semibold">{p.name}</span>
                    <div className="text-sm text-cyan-200">Permainan Ke : {p["Jumlah Permainan"]}</div>
                  </div>
                </div>

                {/* Skor */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">Skor {p.score}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
