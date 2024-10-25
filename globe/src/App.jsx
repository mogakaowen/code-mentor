// import Globe from "./components/Globe";
import { useEffect, useState } from "react";
import Globe2 from "./components/Globe2";
// import Globe from "./components/Globe";

function App() {
  console.log("App rendered");

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const countryData = data.map((country) => ({
          name: country.name.common,
          continent: country.continents[0],
          latitude: country.latlng[0],
          longitude: country.latlng[1],
        }));
        setCountries(countryData);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  return (
    <div className="p-2">
      {/* <Globe countries={countries} /> */}
      <Globe2 countries={countries} />
    </div>
  );
}

export default App;
