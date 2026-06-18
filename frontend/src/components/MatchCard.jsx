import "./match.css";

export default function MatchCard({ mascota, onLike, onDislike }) {
  return (
    <div className="card" style={{ width: "300px", margin: "30px auto" }}>
      {mascota.imagen}

      <div className="card-body">
        <h3>{mascota.nombre}</h3>
        <p>{mascota.tipo} - {mascota.edad} años</p>
        <p>{mascota.ubicacion}</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-no" onClick={() => onDislike(mascota)}>❌</button>
          <button className="btn" onClick={() => onLike(mascota)}>❤️</button>
        </div>
      </div>
    </div>
  );
}