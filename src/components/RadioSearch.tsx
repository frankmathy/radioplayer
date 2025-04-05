import { useState } from 'react';
import { RadioBrowserApi } from 'radio-browser-api';

interface RadioStation {
  id: string;
  name: string;
  url: string;
}

const RadioSearch = () => {
  const [stationName, setStationName] = useState('');
  const [stations, setStations] = useState<RadioStation[]>([]);

  const handleSearch = async () => {
    try {
      const api = new RadioBrowserApi('My Radio App');
      const searchResults = await api.searchStations({
        name: stationName,
        limit: 30,
      });
      setStations(searchResults);
    } catch (error) {
      console.error('Error searching for radio stations:', error);
    }
  };

  return (
    <div className="radio-search">
      <div className="search-container">
        <label htmlFor="station-name">Station Name:</label>
        <input
          type="text"
          id="station-name"
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder="Enter station name"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {stations.length > 0 && (
        <div className="results">
          <h2>Search Results:</h2>
          <ul>
            {stations.map((station) => (
              <li key={station.id}>
                {station.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RadioSearch;