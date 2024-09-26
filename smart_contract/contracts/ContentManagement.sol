// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentManagement {
    // Mapping of movie IDs to movie structs
    mapping(uint256 => Movie) private movies;

    // Event emitted when a new movie is created
    event NewMovie(uint256 indexed movieId, string name, uint256 releaseDate, uint256 endDate, string description);

    // Event emitted when a movie is released
    event MovieReleased(uint256 indexed movieId);

    // Struct to represent a movie
    struct Movie {
        uint256 id;
        string name;
        string rate; // e.g. "R", "P12"
        uint256 releaseDate;
        uint256 endDate;
        string description;
        bool isReleased;
    }

    // Only the owner can create a new movie
    address private owner;

    // Movie ID counter, starting from 1
    uint256 private movieIdCounter = 1;

    // Constructor to set the owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can create a new movie");
        _;
    }

    // Modifier to check if the movie exists
    modifier movieExists(uint256 _id) {
        require(movies[_id].id != 0, "Movie does not exist");
        _;
    }

    // Modifier to check if the movie can be released
    modifier canRelease(uint256 _id) {
        require(movies[_id].releaseDate <= block.timestamp, "Movie has not reached the release date");
        require(!movies[_id].isReleased, "Movie has already been released");
        _;
    }

    // Create a new movie
    function createMovie(
        string memory _name,
        string memory _rate,
        uint256 _releaseDate,
        uint256 _endDate,
        string memory _description
    ) public onlyOwner {
        require(_releaseDate < _endDate, "Release date must be before the end date");

        // Create a new movie struct
        Movie memory newMovie = Movie({
            id: movieIdCounter,
            name: _name,
            rate: _rate,
            releaseDate: _releaseDate,
            endDate: _endDate,
            description: _description,
            isReleased: false
        });

        // Add movie to the mapping
        movies[movieIdCounter] = newMovie;

        // Emit event for new movie creation
        emit NewMovie(movieIdCounter, _name, _releaseDate, _endDate, _description);

        // Increment movie ID counter
        movieIdCounter++;
    }

    // Release a movie when the release date is reached
    function releaseMovie(uint256 _id) public movieExists(_id) canRelease(_id) {
        Movie storage movie = movies[_id];
        movie.isReleased = true;

        emit MovieReleased(_id);
    }

    // Check if a movie is available to watch
    function isMovieAvailable(uint256 _id) public view movieExists(_id) returns (bool) {
        Movie memory movie = movies[_id];
        return movie.isReleased && movie.endDate >= block.timestamp;
    }

    // Get movie details
    function getMovie(uint256 _id) public view movieExists(_id) returns (
        string memory name,
        string memory rate,
        uint256 releaseDate,
        uint256 endDate,
        string memory description,
        bool isReleased
    ) {
        Movie memory movie = movies[_id];
        return (
            movie.name,
            movie.rate,
            movie.releaseDate,
            movie.endDate,
            movie.description,
            movie.isReleased
        );
    }

    // Get total number of movies
    function getMovieCount() public view returns (uint256) {
        return movieIdCounter > 0 ? movieIdCounter - 1 : 0;
    }
}
