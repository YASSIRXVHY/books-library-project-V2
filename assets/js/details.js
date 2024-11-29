document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookTitle = urlParams.get('title');
  const searchInput = document.querySelector('.input');
  const searchForm = document.querySelector('form[name="search"]');
  const wishlistBtn = document.querySelector('.add-wishlist');
  const readBtn = document.querySelector('.read-btn');
  const viewLinkBtn = document.querySelector('.view-link');
  const shareBtn = document.querySelector('.share-btn');

  // Fetch books from the JSON file
  fetch("/assets/js/data.json")
    .then(response => response.json())
    .then(books => {
      // Initial book display or search handling
      let currentBook = null;
      if (bookTitle) {
        // If a book title is in the URL, display its details
        currentBook = findBookByTitle(books, bookTitle);
        displayBookDetails(currentBook);
        checkWishlistStatus(currentBook);
      }

      // Search functionality
      function performSearch(event) {
        event.preventDefault(); // Prevent form submission
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Find matching book
        const matchedBook = books.find(book => 
          book.title.toLowerCase().includes(searchTerm) || 
          book.author.name.toLowerCase().includes(searchTerm)
        );

        if (matchedBook) {
          // Update URL and display book details
          history.pushState(null, '', `/assets/html/details.html?title=${encodeURIComponent(matchedBook.title)}`);
          currentBook = matchedBook;
          displayBookDetails(matchedBook);
          checkWishlistStatus(matchedBook);
        } else {
          // Handle no book found
          document.querySelector('.container').innerHTML = `
            <div style="color: white; text-align: center; padding: 20px;">
              No book found matching "${searchTerm}"
            </div>
          `;
        }
      }

      // Add event listeners for search
      searchForm.addEventListener('submit', performSearch);
      searchInput.addEventListener('input', (event) => {
        performSearch({
          preventDefault: () => {},
          target: event.target
        });
      });

      // Wishlist button event listener
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => handleAddToWishlist(currentBook));
      }

      // Read button event listener
      if (readBtn) {
        readBtn.addEventListener('click', () => {
          if (currentBook.pdfLink) {
            window.open(currentBook.pdfLink, '_blank');
          } else {
            alert('PDF link not available for this book.');
          }
        });
      }

      // View Link button event listener
      if (viewLinkBtn) {
        viewLinkBtn.addEventListener('click', () => {
          if (currentBook.pdfLink) {
            window.open(currentBook.pdfLink, '_blank');
          } else {
            alert('PDF link not available for this book.');
          }
        });
      }

      // Share button event listener
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          // Check if the Web Share API is supported
          if (navigator.share) {
            // Prepare share data
            const shareData = {
              title: currentBook.title,
              text: `Check out this book: ${currentBook.title} by ${currentBook.author.name}`,
              url: window.location.href
            };

            // Use Web Share API
            navigator.share(shareData)
              .then(() => {
                console.log('Book shared successfully');
              })
              .catch((error) => {
                console.error('Error sharing book:', error);
                fallbackShare(currentBook);
              });
          } else {
            // Fallback for browsers that don't support Web Share API
            fallbackShare(currentBook);
          }
        });
      }
    })
    .catch(error => {
      console.error('Error fetching book details:', error);
      document.querySelector('.container').innerHTML = `
        <div style="color: white; text-align: center; padding: 20px;">
          Error loading book details: ${error.message}
        </div>
      `;
    });

  // Fallback share method
  function fallbackShare(book) {
    // Create a temporary textarea to copy text
    const tempInput = document.createElement('textarea');
    tempInput.value = `Check out this book: ${book.title} by ${book.author.name}
    
Read more at: ${window.location.href}`;
    
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
      // Copy text to clipboard
      document.execCommand('copy');
      alert('Book details copied to clipboard! You can now share it.');
    } catch (err) {
      console.error('Unable to copy text', err);
      alert('Unable to share. Please manually copy the book details.');
    }
    
    document.body.removeChild(tempInput);
  }

  // Check if book is in wishlist and update button
  function checkWishlistStatus(book) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.some(item => item.title === book.title);
    
    const wishlistBtn = document.querySelector('.add-wishlist');
    if (isInWishlist) {
      wishlistBtn.classList.add('in-wishlist');
      wishlistBtn.innerHTML = `<i class="fas fa-heart"></i> IN WISHLIST`;
    } else {
      wishlistBtn.classList.remove('in-wishlist');
      wishlistBtn.innerHTML = `<i class="far fa-heart"></i> ADD TO WISHLIST`;
    }
  }

  // Function to add book to wishlist
  function handleAddToWishlist(book) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Check if book is already in wishlist
    const isBookInWishlist = wishlist.some(item => item.title === book.title);
    
    if (!isBookInWishlist) {
      // Prepare wishlist item
      const wishlistItem = {
        title: book.title,
        image: book.image,
        author: book.author.name
      };

      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Update button style
      const wishlistBtn = document.querySelector('.add-wishlist');
      wishlistBtn.classList.add('in-wishlist');
      wishlistBtn.innerHTML = `<i class="fas fa-heart"></i> IN WISHLIST`;
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      alert('Book added to wishlist!');
    } else {
      alert('This book is already in your wishlist.');
    }
  }

  // Helper function to find book by title
  function findBookByTitle(books, title) {
    const book = books.find(b => b.title === title);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  // Function to display book details
  function displayBookDetails(book) {
    // Populate the details page with the book's information
    document.querySelector('.title').textContent = book.title;
    document.querySelector('.description').textContent = book.description;
    
    // Set image
    const imgElement = document.querySelector('.poster img');
    imgElement.src = book.image;
    imgElement.alt = book.title;
    
    // Update tags (genres, year, etc.)
    const tagsContainer = document.querySelector('.tags');
    tagsContainer.innerHTML = ''; // Clear existing tags
    
    // Add PDF tag
    const pdfTag = document.createElement('span');
    pdfTag.classList.add('pdf-tag');
    pdfTag.textContent = 'PDF';
    tagsContainer.appendChild(pdfTag);
    
    // Add genres
    if (book.genres && book.genres.length > 0) {
      book.genres.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.classList.add('genre');
        genreTag.textContent = genre;
        tagsContainer.appendChild(genreTag);
      });
    }
    
    // Add year
    const yearTag = document.createElement('span');
    yearTag.classList.add('year');
    yearTag.textContent = book.year || 'N/A';
    tagsContainer.appendChild(yearTag);

    // Add author information
    const authorElement = document.createElement('p');
    authorElement.classList.add('author');
    authorElement.textContent = `By ${book.author.name}`;
    document.querySelector('.content').insertBefore(authorElement, document.querySelector('.tags'));
  }
});