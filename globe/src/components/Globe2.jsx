import { useEffect, useRef, useState, useCallback } from "react";
import { countries as Countries, regions } from "country-data-list";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { countries as countryList } from "../utils/countries";
import { continents } from "../utils/continents";

const Globe = () => {
  console.log("Globe rendered");
  const width = 600;
  const height = 500;
  const canvasRef = useRef();
  const [land, setLand] = useState(null);
  const [borders, setBorders] = useState(null); // State for country borders
  const [currentRotation, setCurrentRotation] = useState([0, 0, 0]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState([]);

  const countries = countryList.map((country) => {
    const countryInfo = Countries.all.find((c) => c.name === country.name);

    const regionEntry = countryInfo
      ? Object.values(regions).find((region) =>
          region.countries.includes(countryInfo.alpha2)
        )
      : null;

    const continentEntry = countryInfo
      ? continents.find((continent) =>
          continent.countries.includes(countryInfo.alpha2)
        )
      : null;

    return {
      ...country,
      region: regionEntry ? regionEntry.name : "Other",
      continent: continentEntry ? continentEntry.name : "Unknown",
    };
  });

  const projection = d3
    .geoOrthographic()
    .scale(200)
    .translate([width / 2, height / 2])
    .rotate(currentRotation);

  const path = d3.geoPath(projection);

  const draw = useCallback(
    (context) => {
      if (!land || !borders) return;

      context.clearRect(0, 0, width, height);

      // Draw the land
      context.beginPath();
      path.context(context)(land);
      context.fillStyle = "#ccc";
      context.fill();
      context.strokeStyle = "#333";
      context.lineWidth = 0.5;
      context.stroke();

      // Draw country borders
      context.beginPath();
      path.context(context)(borders);
      context.strokeStyle = "#888"; // Color for borders
      context.lineWidth = 0.5;
      context.stroke();

      // Highlight the selected country
      if (selectedCountry) {
        context.beginPath();
        path.context(context)(selectedCountry);
        context.fillStyle = "rgba(255, 0, 0, 0.3)";
        context.fill();
      }

      // Draw pins for visited countries and show their names
      visitedCountries.forEach((country) => {
        const [x, y] = projection([country.longitude, country.latitude]);
        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI);
        context.fillStyle = "orange";
        context.fill();
        context.font = "10px Arial";
        context.fillText(country.name, x + 6, y - 6);
      });

      // Draw pin for the currently selected country
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
    [path, land, borders, selectedCountry, visitedCountries, projection]
  );

  useEffect(() => {
    // Fetch and render the world map data
    d3.json("https://d3js.org/world-110m.v1.json").then((worldData) => {
      const landData = topojson.feature(worldData, worldData.objects.land);
      const bordersData = topojson.mesh(
        worldData,
        worldData.objects.countries,
        (a, b) => a !== b
      ); // Get borders

      setLand(landData);
      setBorders(bordersData);
    });
  }, []);

  // Use a separate effect to handle drawing after the land and borders have been set
  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    draw(context);
  }, [draw]);

  const rotateToCountry = (latitude, longitude) => {
    const context = canvasRef.current.getContext("2d");
    const startRotation = currentRotation;
    const rotate = d3.interpolate(startRotation, [-longitude, -latitude]);

    d3.transition()
      .duration(2000)
      .tween("rotate", () => {
        return (t) => {
          projection.rotate(rotate(t));
          draw(context); // Call draw here with only the context
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
      if (!visitedCountries.find((c) => c.name === country.name)) {
        setVisitedCountries((prev) => [...prev, country]);
      }
      setSelectedCountry(country);
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

    if (!visitedCountries.find((c) => c.name === nearestCountry.name)) {
      setVisitedCountries((prev) => [...prev, nearestCountry]);
    }
    setSelectedCountry(nearestCountry);
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
