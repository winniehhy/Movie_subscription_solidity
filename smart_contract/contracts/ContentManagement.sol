// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentManagement {
    // Mapping of movie IDs to movie structs
    mapping(uint256 => Movie) private movies;

    // Event emitted when a new movie is created
    event NewMovie(
        uint256 indexed movieId,
        string name,
        uint256 releaseDate,
        string description
    );

    // Struct to represent a movie
    struct Movie {
        uint256 id;
        string name;
        string rate; // e.g. "R", "P12"
        uint256 releaseDate;
        string description;
        bool isAvailable; // true if released, false otherwise
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

    // Create a new movie
    function createMovie(
        string memory _name,
        string memory _rate,
        uint256 _releaseDate,
        string memory _description
    ) public onlyOwner {
        // Determine availability based on the release date
        bool availability = _releaseDate <= block.timestamp;

        // Emit debugging information
        emit NewMovie(movieIdCounter, _name, _releaseDate, _description);

        // Create a new movie struct
        Movie memory newMovie = Movie({
            id: movieIdCounter,
            name: _name,
            rate: _rate,
            releaseDate: _releaseDate,
            description: _description,
            isAvailable: availability // Set availability based on the release date
        });

        // Add movie to the mapping
        movies[movieIdCounter] = newMovie;

        // Emit event for new movie creation
        emit NewMovie(movieIdCounter, _name, _releaseDate, _description);

        // Increment movie ID counter
        movieIdCounter++;
    }

    // Check if a movie is available to watch (dynamically checks the release date)
    function isMovieAvailable(
        uint256 _id
    ) public view movieExists(_id) returns (bool) {
        Movie memory movie = movies[_id];
        // Update availability based on the release date
        return movie.releaseDate <= block.timestamp;
    }

    // Get movie details
    function getMovie(
        uint256 _id
    )
        public
        view
        movieExists(_id)
        returns (
            string memory name,
            string memory rate,
            uint256 releaseDate,
            string memory description,
            bool isAvailable
        )
    {
        Movie memory movie = movies[_id];
        return (
            movie.name,
            movie.rate,
            movie.releaseDate,
            movie.description,
            isMovieAvailable(_id) // Dynamically return if movie is available
        );
    }

    // Get total number of movies
    function getMovieCount() public view returns (uint256) {
        return movieIdCounter > 0 ? movieIdCounter - 1 : 0;
    }
}
