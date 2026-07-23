// ...existing code...
import { useEffect, useState } from "react";
import supabase  from "../../supabase";
import AOS from 'aos'
import 'aos/dist/aos.css';


export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
useEffect(() => {
  AOS.init();
}, []);



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

    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-[#FB6C00] to-[#F9B637] text-[#E73F1E] p-4 sm:p-6">

      <div className="w-full max-w-full rounded-2xl border border-blue-400 bg-[#FFDD9C] px-4 py-6 shadow-lg sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <h1 className="text-3xl font-bold text-center tracking-wide text-[#E73F1E] sm:text-4xl mb-6">
          LEADERBOARD
        </h1>

        {/* Jika tidak ada data tampilkan pesan */}
        {players.length === 0 ? (
          <div className="text-center py-8 text-[#E73F1E]">Belum ada Pemain</div>
        ) : (
          <ul className="space-y-4">
            {players.map((p, index) => (
              <li
                key={p.id}
                data-aos="fade-up"
                className="flex flex-col gap-4 rounded-xl border-[#E73F1E] bg-[#FFDD9C] px-4 py-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div  className="flex items-center gap-3" >
                    {/* Medali untuk 3 besar */}
                    {index === 0 && <span className="text-4xl">🥇</span>}
                    {index === 1 && <span className="text-3xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-lg font-semibold">{index + 1}</span>}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src="users.png" alt="Avatar" className="w-full h-full object-cover" />
                  </div>

                  {/* Nama pemain */}
                  <div className="min-w-0">
                    <span className="font-semibold truncate block">{p.name}</span>
                    <div className="text-sm text-[#E73F1E]">Permainan Ke : {p["Jumlah Permainan"]}</div>
                  </div>
                </div>

                {/* Skor */}
                <div className="flex items-center justify-start gap-2 sm:justify-end">
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
