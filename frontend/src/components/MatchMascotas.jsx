import { useEffect, useState } from "react";
import MatchCard from "./MatchCard";

export default function MatchMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [index, setIndex] = useState(0);

  // 🔗 traer mascotas desde API
  useEffect(() => {
    fetch("http://localhost:3000/mascotas")
      .then(res => res.json())
      .then(data => setMascotas(data));
  }, []);

  const mascotaActual = mascotas[index];

  // ❤️ LIKE
  const handleLike = (mascota) => {
    console.log("Interes en:", mascota);

    // 👉 opcional: enviar al backend
    fetch("http://localhost:3000/interes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mascotaId: mascota.id,
        interes: true
      })
    });

    // 👉 simulación de match
    const match = Math.random() > 0.5;

    if (match) {
      alert("🐾 ¡HAY MATCH! Podés adoptar esta mascota");
    }

    siguiente();
  };

  // ❌ DISLIKE
  const handleDislike = () => {
    siguiente();
  };

  const siguiente = () => {
    setIndex(index + 1);
  };

  if (!mascotaActual) return <p>No hay más mascotas</p>;

  return (
    <div>
      <MatchCard
        mascota={mascotaActual}
        onLike={handleLike}
        onDislike={handleDislike}
      />
    </div>
  );
}
