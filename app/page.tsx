'use client'
import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({ name: '', date: '', meal: 'mic dejun', status: 'da' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  const selectedDate = new Date(form.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate <= today) {
    setMessage('⚠️ Nu poți modifica ziua curentă sau trecută.');
    return;
  }

  try {
    const res = await fetch('/api/modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (res.ok && data) {
      setMessage(data.message || '✅ Modificare aplicată cu succes!');
    } else {
      setMessage(data?.error || '❌ Ceva nu a mers.');
    }
  } catch (err) {
    console.error('Eroare la submit:', err);
    setMessage('❌ Eroare de rețea sau server.');
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-xl shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Modifică Masa</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" type="text" placeholder="Nume" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border p-2 rounded" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <select className="w-full border p-2 rounded" value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })}>
          <option value="mic dejun">Mic dejun</option>
          <option value="prânz">Prânz</option>
          <option value="cină">Cină</option>
        </select>
        <select className="w-full border p-2 rounded" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="da">Da</option>
          <option value="nu">Nu</option>
        </select>
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Trimite</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

