$(document).ready(() => {
    $('#hamburger-menu').click(() => {
        $('#hamburger-menu').toggleClass('active')
        $('#nav-menu').toggleClass('active')
    })

    // setting owl carousel

    let navText = ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"]

    $('#hero-carousel').owlCarousel({
        items: 1,
        dots: false,
        loop: true,
        nav:true,
        navText: navText,
        autoplay: true,
        autoplayHoverPause: true
    })

    $('#top-movies-slide').owlCarousel({
        items: 2,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            500: {
                items: 3
            },
            1280: {
                items: 4
            },
            1600: {
                items: 6
            }
        }
    })

    $('.movies-slide').owlCarousel({
        items: 2,
        dots: false,
        nav:true,
        navText: navText,
        margin: 15,
        responsive: {
            500: {
                items: 2
            },
            1280: {
                items: 4
            },
            1600: {
                items: 6
            }
        }
    })


    // MetaMask connection
    $('#connectButton').click(async (event) => {
        event.preventDefault();
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('Connected account:', accounts[0]);
                $('#connectButton span:first-child').text(''); // Remove "Connect Wallet" text
                $('#userAddress').text(accounts[0]); // Update the user address display
            } catch (error) {
                console.error('Error connecting to MetaMask:', error.message);
            }
        } else {
            console.error('MetaMask is not installed!');
            alert('Please install MetaMask!');
        }
    });

    // Show dropdown when clicking on user address
    $('#userAddress').click((event) => {
        event.preventDefault();
        $('#walletDropdown').toggle(); // Toggle the dropdown menu
    });

    // Disconnect Wallet
    $('#disconnectButton').click((event) => {
        event.preventDefault();
        $('#connectButton span:first-child').text('Connect Wallet'); // Restore "Connect Wallet" text
        $('#userAddress').text(''); // Clear the user address display
        $('#walletDropdown').hide(); // Hide the dropdown menu
        console.log('Wallet disconnected');
    });

    // Hide dropdown when clicking outside
    $(document).click((event) => {
        if (!$(event.target).closest('#connectButton').length && !$(event.target).closest('#userAddress').length) {
            $('#walletDropdown').hide();
        }
    });
})
