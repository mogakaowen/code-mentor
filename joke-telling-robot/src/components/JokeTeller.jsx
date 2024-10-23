import { useState, useEffect, useCallback, useMemo } from "react";
import { Select, Button } from "antd";

const { Option } = Select;

const JokeTeller = () => {
  const [joke, setJoke] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedGif, setSelectedGif] = useState("");
  // Memoize the array of GIF URLs to prevent re-creation on every render
  const gifs = useMemo(
    () => [
      "/roboDance.gif",
      "/roboDance2.gif",
      "/roboDance3.gif",
      "/roboDance4.gif",
    ],
    []
  );

  const laughsArray = useMemo(
    () => [
      "U RO RO RO RO RO RO RO RO RO",
      "HA HA HA HA HA HA HA HA HA",
      "DE RE SHI SHI SHI SHI SHI SHI SHI SHI",
      "SHI LO LO LO LO LO LO LO LO",
      "ZE HA HA HA HA HA HA HA HA HA",
    ],
    []
  );

  useEffect(() => {
    // Fetch available voices for the speech synthesis
    const synth = window.speechSynthesis;
    const fetchVoices = () => {
      setVoices(synth.getVoices());
    };
    fetchVoices();
    synth.onvoiceschanged = fetchVoices;
  }, []);

  const fetchAndSpeakJoke = useCallback(async () => {
    try {
      // Fetch the joke from the API
      const response = await fetch(
        "https://official-joke-api.appspot.com/jokes/programming/random"
      );

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const jokeData = data[0];
      setJoke(jokeData); // Update joke in state

      // Randomly select a GIF from the memoized array
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      setSelectedGif(randomGif);

      // Randomly select a laugh from the laughsArray
      const randomLaugh =
        laughsArray[Math.floor(Math.random() * laughsArray.length)];

      // Speak the joke with a randomly selected laugh
      const utterance = new SpeechSynthesisUtterance(
        `${jokeData.setup} ${jokeData.punchline} ${randomLaugh}`
      );
      utterance.lang = language;

      // Show the robot GIF while speaking
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false); // Hide GIF when done speaking

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Failed to fetch the joke:", error);
      setJoke({
        setup: "Oops!",
        punchline: "Something went wrong. Please try again later.",
      });
    }
  }, [language, gifs, laughsArray]);

  const handleChangeLanguage = (value) => {
    setLanguage(value);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "j" || event.key === "J") {
        fetchAndSpeakJoke(); // Fetch and speak joke on 'J' press
      }
    };

    const handleSpeechRecognition = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.toLowerCase() === "tell me a joke") {
          fetchAndSpeakJoke();
        }
      };

      recognition.start();
    };

    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    // Call the speech recognition function when the component mounts
    handleSpeechRecognition();

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fetchAndSpeakJoke, language]);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Randomly display robot GIF */}
      {isSpeaking && selectedGif && (
        <img
          src={selectedGif}
          alt="Robot Speaking"
          className="w-40 h-40 mb-4 rounded-xl"
        />
      )}

      <Button
        onClick={fetchAndSpeakJoke}
        type="primary"
        className="text-white px-5 shadow-none h-full rounded mb-4"
      >
        Tell Me A Joke
      </Button>

      <Select
        value={language}
        onChange={handleChangeLanguage}
        style={{ width: "100%", maxWidth: "300px" }} // Ensure it fits within the layout
        dropdownStyle={{ maxWidth: "300px" }}
      >
        {voices.map((voice, index) => (
          <Option key={index} value={voice.lang}>
            {voice.name} ({voice.lang})
          </Option>
        ))}
      </Select>

      <p className="mt-4 text-center">
        {joke && `${joke.setup} - ${joke.punchline}`}
      </p>
    </div>
  );
};

export default JokeTeller;
