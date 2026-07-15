import { useEffect, useState } from "react";
import supabase from "../../supabase";

function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("score", { ascending: false })
        .limit(1000);

      if (!error) setPlayers(data);
    };

    fetchPlayers();
    const intervalId = setInterval(fetchPlayers, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="Leaderboard" className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-[#0a1f44] to-[#1a2a6c] text-white font-poppins px-4 sm:px-6 lg:px-8">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 max-w-full w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl border border-yellow-400">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-yellow-300 mb-4 sm:mb-6 tracking-widest">
          LEADERBOARD
        </h2>

        <div className="space-y-3 max-h-[60vh] sm:max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400">
          {players.length === 0 ? (
            <div className="flex items-center justify-center h-48 bg-white/10 rounded-lg px-4 py-6 text-center text-sm sm:text-base text-yellow-100">
              Belum ada data leaderboard.
            </div>
          ) : (
            players.map((player, i) => (
              <div
                key={player.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/10 rounded-lg px-3 sm:px-4 py-3 hover:bg-white/20 transition gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-semibold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="text-base sm:text-lg font-medium truncate">{player.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-sm hidden xs:inline-block sm:inline-block">
                    {"⭐".repeat(Math.max(0, Math.min(Math.floor(player.score / 500), 5)))}
                  </span>
                  <span className={player.score < 0 ? "text-red-400 font-bold" : "text-cyan-300 font-semibold"}>
                    {player.score}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
