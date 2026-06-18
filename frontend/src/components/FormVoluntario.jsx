import { useState } from "react";

export default function FormVoluntario() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "",
    disponibilidad: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("✅ Postulación enviada");

    setForm({
      nombre: "",
      email: "",
      telefono: "",
      tipo: "",
      disponibilidad: ""
    });
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
        <div className="card-body">
          <h2>Voluntariado 🐾</h2>

          <input name="nombre" placeholder="Nombre" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="telefono" placeholder="Teléfono" onChange={handleChange} />

          <select name="tipo" onChange={handleChange}>
            <option>Tipo de ayuda</option>
            <option>Tránsito</option>
            <option>Traslado</option>
            <option>Difusión</option>
          </select>

          <textarea name="disponibilidad" placeholder="Disponibilidad" onChange={handleChange}></textarea>

          <button className="btn">Enviar</button>
        </div>
      </form>
    </div>
  );
}