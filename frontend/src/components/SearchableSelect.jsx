import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder = 'Pilih...', required = false, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value || ''} />
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={`w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className="ml-2 text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</div>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${String(o.value) === String(value) ? 'bg-orange-100 font-medium' : ''}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {required && !value && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', opacity: 0, width: '100%', height: 0 }}
          value=""
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
