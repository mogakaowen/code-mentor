import { Form, Input, Switch } from "antd";
import { useContext, useState } from "react";
import { SearchOutlined, YoutubeOutlined } from "@ant-design/icons"; // Import the search and YouTube icons
import { ThemeContext } from "../../store/theme-context";

const { Search } = Input; // Destructure Search from Input

const SearchBar = ({ onSearch }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [query, setQuery] = useState("");

  const handleSearch = (value) => {
    console.log("searching...");
    if (value.trim()) {
      onSearch(value);
      setQuery("");
    }
  };

  return (
    <div className="flex items-center justify-start w-full px-4">
      <div
        className="flex items-center text-red-600 cursor-pointer"
        onClick={toggleTheme}
      >
        <YoutubeOutlined className="text-3xl mr-2" /> {/* YouTube icon */}
        <p className="font-bold">MiTube</p>
        {/* Label for Mi-Tube */}
      </div>
      <Form
        className="flex items-center md:w-2/3 ml-10"
        onFinish={() => handleSearch(query)}
      >
        <Form.Item name="query" className="w-full" style={{ marginBottom: 0 }}>
          <Search
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for videos..."
            enterButton={<SearchOutlined />} // Use Search icon as the button
            onSearch={handleSearch} // Call handleSearch on search
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default SearchBar;
