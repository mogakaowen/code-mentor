import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { countries } from "../utils/countries";

const Globe = () => {
  const width = 600;
  const height = 500;
  const canvasRef = useRef();
  const [land, setLand] = useState(null);
  const [currentRotation, setCurrentRotation] = useState([0, 0, 0]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState([]);

  // Reduce globe size by lowering the scale value
  const projection = d3
    .geoOrthographic()
    .scale(200) // Adjusted to reduce globe size
    .translate([width / 2, height / 2])
    .rotate(currentRotation);

  const path = d3.geoPath(projection);

  // Draw the globe with optional country highlight and pins
  const draw = useCallback(
    (context, landData, highlightCountry) => {
      context.clearRect(0, 0, width, height);
      context.beginPath();
      path.context(context)(landData);
      context.fillStyle = "#ccc";
      context.fill();
      context.strokeStyle = "#333";
      context.lineWidth = 0.5;
      context.stroke();

      // Highlight selected country
      if (highlightCountry) {
        context.beginPath();
        path.context(context)(highlightCountry);
        context.fillStyle = "rgba(255, 0, 0, 0.3)"; // Highlight color
        context.fill();
      }

      // Draw pins for visited countries and show their names
      visitedCountries.forEach((country) => {
        const [x, y] = projection([country.longitude, country.latitude]);
        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI); // Pin marker
        context.fillStyle = "orange"; // Previously visited countries are orange
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
        context.arc(x, y, 4, 0, 2 * Math.PI); // Pin marker
        context.fillStyle = "red"; // Current country is red
        context.fill();
        context.font = "10px Arial";
        context.fillText(selectedCountry.name, x + 6, y - 6);
      }
    },
    [path, width, height, selectedCountry, visitedCountries, projection]
  );

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");

    // Fetch and render the world map data
    d3.json("https://d3js.org/world-110m.v1.json").then((worldData) => {
      const landData = topojson.feature(worldData, worldData.objects.land);
      setLand(landData);
      draw(context, landData);
    });
  }, [draw]);

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
          draw(context, land, selectedCountry);
        };
      })
      .on("end", () => {
        setCurrentRotation([-longitude, -latitude]);
      });
  };

  // Handle country selection from the dropdown
  const handleCountryChange = (e) => {
    const selectedCountryName = e.target.value;
    const country = countries.find((c) => c.name === selectedCountryName);
    if (country) {
      if (!visitedCountries.find((c) => c.name === country.name)) {
        setVisitedCountries([...visitedCountries, country]); // Add to visited list
      }
      setSelectedCountry(country);
      rotateToCountry(
        parseFloat(country.latitude),
        parseFloat(country.longitude)
      );
    }
  };

  // Handle country selection by clicking on the globe
  const handleGlobeClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [longitude, latitude] = projection.invert([x, y]) || [];

    // Find nearest country based on click coordinates
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
      setVisitedCountries([...visitedCountries, nearestCountry]);
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
        onClick={handleGlobeClick} // Listen for clicks on the canvas
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
