document.addEventListener('DOMContentLoaded', () => {
  const wishlistContainer = document.querySelector('.wishlist-books');
  const totalBooksElement = document.getElementById('total-books');
  const emptyWishlistMessage = document.querySelector('.empty-wishlist');

  // Function to load and display wishlist
  function loadWishlist() {
    // Retrieve wishlist from localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Update total books count
    if (totalBooksElement) {
      totalBooksElement.textContent = wishlist.length;
    }

    // Toggle empty wishlist message
    if (wishlist.length === 0) {
      if (emptyWishlistMessage) {
        emptyWishlistMessage.style.display = 'block';
      }
      if (wishlistContainer) {
        wishlistContainer.innerHTML = '';
      }
      return;
    } else {
      if (emptyWishlistMessage) {
        emptyWishlistMessage.style.display = 'none';
      }
    }

    // Clear previous wishlist
    if (wishlistContainer) {
      wishlistContainer.innerHTML = '';
    }

    // Render wishlist books
    wishlist.forEach((book, index) => {
      if (!wishlistContainer) return;

      const bookCard = document.createElement('div');
      bookCard.classList.add('book', 'wishlist-book');
      bookCard.innerHTML = `
        <div class="wishlist-book-content">
          <div class="image_container">
            <img src="${book.image}" alt="${book.title}" />
            <button class="remove-from-wishlist" data-index="${index}">
            <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div class="book-details">
            <h5>${book.title}</h5>
            <p>${book.author}</p>
            <div class="wishlist-actions">
              <button class="view-details" data-title="${book.title}">
                <i class="fas fa-eye"></i> View Details
              </button>
              <button class="mark-as-read" data-index="${index}" data-read="${book.isRead || false}">
                <i class="fas ${book.isRead ? 'fa-check-circle' : 'fa-book-open'}"></i> 
                ${book.isRead ? 'Completed' : 'Mark as Read'}
              </button>
            </div>
          </div>
        </div>
      `;

      wishlistContainer.appendChild(bookCard);
    });

    // Add event listeners for remove, view details, and mark as read buttons
    addWishlistEventListeners();
  }

  // Function to add event listeners to wishlist buttons
  function addWishlistEventListeners() {
    // Remove from wishlist
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        removeFromWishlist(parseInt(index));
      });
    });

    // View Details
    const viewDetailsButtons = document.querySelectorAll('.view-details');
    viewDetailsButtons.forEach(button => {
      button.addEventListener('click', () => {
        const bookTitle = button.getAttribute('data-title');
        window.location.href = `/assets/html/details.html?title=${encodeURIComponent(bookTitle)}`;
      });
    });

    // Mark as Read
    const markAsReadButtons = document.querySelectorAll('.mark-as-read');
    markAsReadButtons.forEach(button => {
      button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        toggleReadStatus(parseInt(index));
      });
    });
  }

  // Function to remove book from wishlist
  function removeFromWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Remove book at specific index
    wishlist.splice(index, 1);
    
    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Reload wishlist
    loadWishlist();

    // Trigger storage event to update other pages
    window.dispatchEvent(new Event('storage'));
  }

  // Function to toggle read status
  function toggleReadStatus(index) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Toggle read status
    wishlist[index].isRead = !wishlist[index].isRead;
    
    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Reload wishlist
    loadWishlist();

    // Trigger storage event to update other pages
    window.dispatchEvent(new Event('storage'));
  }

  // Initial load of wishlist
  loadWishlist();

  // Listen for wishlist updates from other pages
  window.addEventListener('storage', (event) => {
    if (event.key === 'wishlist') {
      loadWishlist();
    }
  });
});
// In the addWishlistEventListeners function, update the mark as read button rendering
const markAsReadButton = `
  <button class="mark-as-read ${book.isRead ? 'completed' : ''}" data-index="${index}" data-read="${book.isRead || false}">
    <i class="fas ${book.isRead ? 'fa-check-circle' : 'fa-book-open'}"></i> 
    ${book.isRead ? 'Completed' : 'Mark as Read'}
  </button>
`;