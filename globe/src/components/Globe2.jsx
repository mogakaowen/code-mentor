import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { countries } from "../utils/countries";

const Globe = () => {
  const width = 600;
  const height = 500;
  const canvasRef = useRef();
  const [land, setLand] = useState(null);
  const [borders, setBorders] = useState(null); // State for country borders
  const [currentRotation, setCurrentRotation] = useState([0, 0, 0]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [continentCountries, setContinentCountries] = useState([]); // State for countries in the same continent

  console.log(countries);

  const projection = d3
    .geoOrthographic()
    .scale(200)
    .translate([width / 2, height / 2])
    .rotate(currentRotation);

  const path = d3.geoPath(projection);

  const draw = useCallback(
    (context, landData, bordersData, highlightCountries) => {
      context.clearRect(0, 0, width, height);

      // Draw the land
      context.beginPath();
      path.context(context)(landData);
      context.fillStyle = "#ccc";
      context.fill();
      context.strokeStyle = "#333";
      context.lineWidth = 0.5;
      context.stroke();

      // Draw country borders
      context.beginPath();
      path.context(context)(bordersData);
      context.strokeStyle = "#888"; // Color for borders
      context.lineWidth = 0.5;
      context.stroke();

      // Highlight the selected country and countries in the same continent
      highlightCountries.forEach((country) => {
        context.beginPath();
        path.context(context)(country);
        context.fillStyle = "rgba(255, 0, 0, 0.3)"; // Highlight color
        context.fill();
      });

      // Draw pins for the currently selected country
      if (selectedCountry) {
        const [x, y] = projection([
          selectedCountry.longitude,
          selectedCountry.latitude,
        ]);
        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI);
        context.fillStyle = "red";
        context.fill();
        context.font = "10px Arial";
        context.fillText(selectedCountry.name, x + 6, y - 6);
      }
    },
    [path, width, height, selectedCountry, projection]
  );

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");

    // Fetch and render the world map data
    d3.json("https://d3js.org/world-110m.v1.json").then((worldData) => {
      const landData = topojson.feature(worldData, worldData.objects.land);
      const bordersData = topojson.mesh(
        worldData,
        worldData.objects.countries,
        (a, b) => a !== b
      ); // Get borders
      setLand(landData);
      setBorders(bordersData); // Set borders state
      draw(context, landData, bordersData, continentCountries);
    });
  }, [draw, continentCountries]);

  // Rotate the globe to the selected country
  const rotateToCountry = (latitude, longitude) => {
    const context = canvasRef.current.getContext("2d");
    const startRotation = currentRotation;
    const rotate = d3.interpolate(startRotation, [-longitude, -latitude]);

    d3.transition()
      .duration(2000)
      .tween("rotate", () => {
        return (t) => {
          projection.rotate(rotate(t));
          draw(context, land, borders, continentCountries);
        };
      })
      .on("end", () => {
        setCurrentRotation([-longitude, -latitude]);
      });
  };

  const handleCountryChange = (e) => {
    const selectedCountryName = e.target.value;
    const country = countries.find((c) => c.name === selectedCountryName);
    if (country) {
      setSelectedCountry(country);

      // Filter countries in the same continent
      const countriesInSameContinent = countries.filter(
        (c) => c.continent === country.continent
      );
      setContinentCountries(countriesInSameContinent); // Set the countries in the same continent

      rotateToCountry(
        parseFloat(country.latitude),
        parseFloat(country.longitude)
      );
    }
  };

  const handleGlobeClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [longitude, latitude] = projection.invert([x, y]) || [];

    const nearestCountry = countries.reduce((prev, curr) => {
      const currDist = d3.geoDistance(
        [curr.longitude, curr.latitude],
        [longitude, latitude]
      );
      const prevDist = d3.geoDistance(
        [prev.longitude, prev.latitude],
        [longitude, latitude]
      );
      return currDist < prevDist ? curr : prev;
    });

    setSelectedCountry(nearestCountry);

    // Filter countries in the same continent
    const countriesInSameContinent = countries.filter(
      (c) => c.continent === nearestCountry.continent
    );
    setContinentCountries(countriesInSameContinent); // Set the countries in the same continent

    rotateToCountry(nearestCountry.latitude, nearestCountry.longitude);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleGlobeClick}
        className="border border-gray-300 shadow-lg rounded-lg cursor-pointer"
      ></canvas>
      <div className="mt-5">
        <select
          onChange={handleCountryChange}
          value={selectedCountry ? selectedCountry.name : ""}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>Select a country</option>
          {countries.map((country, index) => (
            <option key={index} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Globe;
