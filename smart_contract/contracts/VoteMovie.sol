// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MovieVoting {

    struct Movie {
        string name;
        uint256 votes;
    }

    struct Category {
        string name;
        mapping(string => Movie) movies;
        string[] movieList;  // Array to store movie names for iteration
        mapping(address => bool) hasVoted;
        uint256 startTime;
        uint256 endTime;
        mapping(address => string) votedMovie; // Track the movie voted by each address
    }

    mapping(string => Category) public categories;

    // Modifier to check if voting is open
    modifier votingOpen(string memory categoryName) {
        require(block.timestamp >= categories[categoryName].startTime, "Voting has not started yet.");
        require(block.timestamp <= categories[categoryName].endTime, "Voting has ended.");
        _;
    }

    // Modifier to ensure the user has not already voted
    modifier hasNotVoted(string memory categoryName) {
        require(!categories[categoryName].hasVoted[msg.sender], "You have already voted in this category.");
        _;
    }

    // Function to add movie category
    constructor(){
        addCategory("Best Movie in august 2024", 1722384000, 1725062400);
        addCategory("Best Comedy Movie in august 2024", 1722384000, 1725062400);
        addCategory("Best Horror Movie in august 2024", 1722384000, 1725062400);
        addCategory("Best Movie in october 2024", 1727654400, 1730332800);
        addCategory("Best Comedy Movie in october 2024", 1727654400, 1730332800);
        addCategory("Best Horror Movie in october 2024", 1727654400, 1730332800);
        addCategory("Best Movie in September 2024", 1725062400, 1727654400);
        addCategory("Best Comedy Movie in September 2024", 1725062400, 1727654400);
        addCategory("Best Horror Movie in September 2024", 1725062400, 1727654400);
        addMovieToCategory("Best Movie in august 2024", "Inside Out 2");
        addMovieToCategory("Best Movie in october 2024", "Inside Out 2");
        addMovieToCategory("Best Movie in September 2024", "Inside Out 2");
        addMovieToCategory("Best Movie in September 2024", "Deadpool & Wolverine");
        addMovieToCategory("Best Movie in September 2024", "Beetlejuice Beetlejuice");
        addMovieToCategory("Best Movie in September 2024", "Longlegs");
        addMovieToCategory("Best Movie in September 2024", "Sonic the Hedgehog 3");
        addMovieToCategory("Best Movie in September 2024", "The Lord of the Rings: The Rings of Power");
        addMovieToCategory("Best Movie in September 2024", "Transformers One");
        addMovieToCategory("Best Movie in September 2024", "Despicable Me 4");
        addMovieToCategory("Best Movie in September 2024", "His Three Daughters");
        addMovieToCategory("Best Comedy Movie in September 2024", "Inside Out 2");
        addMovieToCategory("Best Comedy Movie in September 2024", "Deadpool & Wolverine");
        addMovieToCategory("Best Comedy Movie in September 2024", "Beetlejuice Beetlejuice");
        addMovieToCategory("Best Comedy Movie in September 2024", "Longlegs");
        addMovieToCategory("Best Comedy Movie in September 2024", "Sonic the Hedgehog 3");
        addMovieToCategory("Best Comedy Movie in September 2024", "The Lord of the Rings: The Rings of Power");
        addMovieToCategory("Best Comedy Movie in September 2024", "Transformers One");
        addMovieToCategory("Best Comedy Movie in September 2024", "Despicable Me 4");
        addMovieToCategory("Best Comedy Movie in September 2024", "His Three Daughters");
        addMovieToCategory("Best Horror Movie in September 2024", "Inside Out 2");
        addMovieToCategory("Best Horror Movie in September 2024", "Deadpool & Wolverine");
        addMovieToCategory("Best Horror Movie in September 2024", "Beetlejuice Beetlejuice");
        addMovieToCategory("Best Horror Movie in September 2024", "Longlegs");
        addMovieToCategory("Best Horror Movie in September 2024", "Sonic the Hedgehog 3");
        addMovieToCategory("Best Horror Movie in September 2024", "The Lord of the Rings: The Rings of Power");
        addMovieToCategory("Best Horror Movie in September 2024", "Transformers One");
        addMovieToCategory("Best Horror Movie in September 2024", "Despicable Me 4");
        addMovieToCategory("Best Horror Movie in September 2024", "His Three Daughters");
    }
    function addCategory(string memory categoryName, uint256 startTime, uint256 endTime) private {
        Category storage category = categories[categoryName];
        category.name = categoryName;
        category.startTime = startTime;
        category.endTime = endTime;
    }

    // Function to add a movie to a category
    function addMovieToCategory(string memory categoryName, string memory movieName) private {
        Category storage category = categories[categoryName];
        category.movies[movieName] = Movie(movieName, 0);
        category.movieList.push(movieName);  // Add movie name to the list
    }

    // Function to submit a vote
    function submitVote(string memory categoryName, string memory movieName) public votingOpen(categoryName) hasNotVoted(categoryName) {
        Category storage category = categories[categoryName];
        category.movies[movieName].votes += 1;
        category.hasVoted[msg.sender] = true;
        category.votedMovie[msg.sender] = movieName; // Track the voted movie
    }

    // Function to view voting results
    function viewVotingResults(string memory categoryName) public view votingOpen(categoryName) returns (string[] memory movieNames, uint256[] memory voteCounts) {
        Category storage category = categories[categoryName];
        uint256 movieCount = category.movieList.length;

        movieNames = new string[](movieCount);
        voteCounts = new uint256[](movieCount);

        for (uint i = 0; i < movieCount; i++) {
            string memory movieName = category.movieList[i];
            movieNames[i] = movieName;
            voteCounts[i] = category.movies[movieName].votes;
        }
    }

    // Function to cancel a vote
    function cancelVote(string memory categoryName) public votingOpen(categoryName) {
        Category storage category = categories[categoryName];
        require(category.hasVoted[msg.sender], "You have not voted in this category.");

        string memory votedMovieName = category.votedMovie[msg.sender];
        category.movies[votedMovieName].votes -= 1; // Decrement the vote count
        category.hasVoted[msg.sender] = false; // Mark the user as not having voted
        delete category.votedMovie[msg.sender]; // Clear the voted movie record
    }
}
