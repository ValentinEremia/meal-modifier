import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name: '',
    date: '',
    meal: 'mic dejun',
    status: 'da',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();
    const selected = new Date(form.date);
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected <= today) {
      setMessage('⚠️ Poți modifica doar mese viitoare.');
      return;
    }

    try {
      const res = await fetch(
        'https://script.google.com/macros/s/AKfycbywDWRx6-EkJ9FSYVSaGVbt_w-WjxL0tnzo9eXQGAoFsYUavT1cPdA4rmoufnScJRpM/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      console.error(err);
      setMessage('❌ Eroare la trimiterea datelor.');
    }
  };

  return (
    <div className="App">
      <h2>Modificare Masă</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nume"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <select name="meal" value={form.meal} onChange={handleChange}>
          <option value="mic dejun">Mic dejun</option>
          <option value="prânz">Prânz</option>
          <option value="cină">Cină</option>
        </select>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="da">Da</option>
          <option value="nu">Nu</option>
        </select>
        <button type="submit">Trimite</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default App;
