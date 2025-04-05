import { useState } from "react";
import { RadioBrowserApi, Station } from "radio-browser-api";
import RadioPlayer from "./RadioPlayer";

const RadioSearch = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationName, setStationName] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    try {
      const api = new RadioBrowserApi("My Radio App");
      const searchResults = await api.searchStations({
        name: stationName,
        limit: 30,
      });
      // Sort the results by country, city (state), and name
      const sortedResults = searchResults.sort((a, b) => {
        const countryCompare = (a.country || '').localeCompare(b.country || '');
        if (countryCompare !== 0) return countryCompare;
        
        const cityCompare = (a.state || '').localeCompare(b.state || '');
        if (cityCompare !== 0) return cityCompare;
        
        return (a.name || '').localeCompare(b.name || '');
      });
      
      setStations(sortedResults);
      setHasSearched(true);
      if (sortedResults.length > 0) {
        setStationName("");
      }
    } catch (error) {
      console.error("Error searching for radio stations:", error);
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
          onChange={(e) => {
            setStationName(e.target.value);
            setHasSearched(false);
            setStations([]);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Enter station name"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {stations.length === 0 && hasSearched && (
        <div className="no-results">No radio stations found for "{stationName}"</div>
      )}

      {selectedStation && <RadioPlayer streamUrl={selectedStation.urlResolved} stationName={selectedStation.name} />}

      {stations.length > 0 && (
        <div className="results">
          <h2>Search Results:</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Homepage</th>
                <th>Country</th>
                <th>City</th>
                <th>Codec</th>
                <th>Bitrate</th>
                <th>Stream</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.id}>
                  <td>{station.name}</td>
                  <td>
                    {station.homepage && (
                      <a href={station.homepage} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    )}
                  </td>
                  <td>{station.country}</td>
                  <td>{station.state}</td>
                  <td>{station.codec}</td>
                  <td>{station.bitrate} kbps</td>
                  <td>
                    <button onClick={() => setSelectedStation(station)} className="play-button">
                      Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RadioSearch;
