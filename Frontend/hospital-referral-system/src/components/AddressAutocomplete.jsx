// src/components/AddressAutocomplete.jsx
import { useState, useEffect, useRef } from 'react';
import './AddressAutocomplete.css';

export default function AddressAutocomplete({ placeholder, defaultValue, onSelect }) {
  const [query, setQuery] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (defaultValue) setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
        })
        .catch(err => console.error('Nominatim error', err))
        .finally(() => setIsLoading(false));
    }, 500);
  }, [query]);

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setQuery(address);
    setSuggestions([]);
    if (onSelect) onSelect({ address, latitude: lat, longitude: lng });
  };

  return (
    <div className="address-autocomplete">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="autocomplete-input"
      />
      {isLoading && <div className="autocomplete-loading">Loading...</div>}
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((s, idx) => (
            <li key={idx} onClick={() => handleSelect(s)}>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}