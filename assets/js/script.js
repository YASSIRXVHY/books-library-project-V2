document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.querySelector(".books");
  const searchInput = document.querySelector(".input");
  const searchForm = document.querySelector('form[name="search"]');
  
  // Fetch books from the JSON file
  fetch("/assets/js/data.json")
    .then(response => response.json())
    .then(books => {
      // Initial display of all books
      displayBooks(books);

      // Search functionality
      function performSearch(event) {
        event.preventDefault(); // Prevent form submission
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Filter books
        const filteredBooks = books.filter(book => 
          book.title.toLowerCase().includes(searchTerm) || 
          book.author.name.toLowerCase().includes(searchTerm)
        );

        // Display filtered or all books
        displayBooks(filteredBooks.length > 0 ? filteredBooks : books);

        // Scroll to books section smoothly
        scrollToBooks();
      }

      // Add event listeners
      searchForm.addEventListener('submit', performSearch);
      searchInput.addEventListener('input', (event) => {
        // Create a fake event object for the performSearch function
        performSearch({
          preventDefault: () => {},
          target: event.target
        });
      });
    })
    .catch(error => {
      console.error('Error fetching books:', error);
      booksContainer.innerHTML = `
        <div style="color: white; text-align: center; padding: 20px;">
          Error loading books: ${error.message}
        </div>
      `;
    });
});

// Function to scroll to books section
function scrollToBooks() {
  const booksSection = document.querySelector(".top_books");
  
  javascript
  if (booksSection) {
    booksSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Function to display books
function displayBooks(books) {
  const booksContainer = document.querySelector(".books");
  
  // Clear previous books
  booksContainer.innerHTML = "";

  // Handle no results
  if (!books || books.length === 0) {
    booksContainer.innerHTML = `
      <div style="color: white; text-align: center; padding: 20px;">
        No books found
      </div>
    `;
    return;
  }

  // Create book cards
  books.forEach(book => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book");
    bookCard.innerHTML = `
      <div class="image_container">
        <img src="${book.image}" alt="${book.title}" />
        <button class="add-to-wishlist" data-title="${book.title}" data-image="${book.image}" data-author="${book.author.name}">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <h5>${book.title}</h5>
      <p>${book.author.name}</p>
      <a href="${book.pdfLink}" target="_blank">
        <button class="pdf-button">PDF</button>
      </a>
    `;

    // Add click event to navigate to details page
    bookCard.addEventListener('click', (event) => {
      // Prevent PDF button or wishlist button from triggering navigation
      if (event.target.closest('.pdf-button') || event.target.closest('.add-to-wishlist')) {
        return;
      }
      
      // Redirect to details page with the book title as a query parameter
      window.location.href = `/assets/html/details.html?title=${encodeURIComponent(book.title)}`;
    });

    // Add event listener for wishlist button
    const wishlistBtn = bookCard.querySelector('.add-to-wishlist');
    wishlistBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      addToWishlist(book);
    });

    booksContainer.appendChild(bookCard);
  });
}

// Function to add book to wishlist
function addToWishlist(book) {
  const wishlistItem = {
    title: book.title,
    image: book.image,
    author: book.author.name
  };

  // Get existing wishlist or create new
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  
  // Check if book is already in wishlist
  const isBookInWishlist = wishlist.some(item => item.title === wishlistItem.title);
  
  if (!isBookInWishlist) {
    wishlist.push(wishlistItem);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert('Book added to wishlist!');
  } else {
    alert('This book is already in your wishlist.');
  }
}