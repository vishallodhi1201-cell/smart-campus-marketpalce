// ============================
// GEMINI AI MARKETPLACE BOT
// ============================

const API_KEY = "AIzaSyDJSDKtu13MQ8gKr9ig3dDJERUPL3sCqkU";

// ============================
// AUTHENTICATION SYSTEM
// ============================

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentBuyItem = null;
let currentSeller = null;
let sellerChatHistory = JSON.parse(localStorage.getItem('sellerChatHistory')) || {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userListings = JSON.parse(localStorage.getItem('userListings')) || [];

// Check if user is logged in on page load
function checkAuthStatus() {
  if (currentUser) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('sellBtn').style.display = 'inline-block';
    document.getElementById('userInfo').style.display = 'inline-block';
    document.getElementById('userName').textContent = `Hi, ${currentUser.name}!`;
  } else {
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('sellBtn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
  }
}

// Open login modal
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

// Close login modal
function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  clearAuthErrors();
}

// Show login tab
function showLoginTab() {
  document.getElementById('loginForm').style.display = 'flex';
  document.getElementById('signupForm').style.display = 'none';
  document.querySelectorAll('.tab-btn')[0].classList.add('active');
  document.querySelectorAll('.tab-btn')[1].classList.remove('active');
  clearAuthErrors();
}

// Show signup tab
function showSignupTab() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'flex';
  document.querySelectorAll('.tab-btn')[0].classList.remove('active');
  document.querySelectorAll('.tab-btn')[1].classList.add('active');
  clearAuthErrors();
}

// Clear authentication errors
function clearAuthErrors() {
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

// Login user
function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    document.getElementById('loginError').textContent = 'Please fill all fields';
    return;
  }
  
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    closeLoginModal();
    checkAuthStatus();
    alert('✅ Login successful!');

    if (currentBuyItem) {
      cart = [{
        ...currentBuyItem,
        id: Date.now()
      }];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      currentBuyItem = null;
      proceedToCheckout();
      return;
    }
  } else {
    document.getElementById('loginError').textContent = 'Invalid email or password';
  }
}

// Signup user
function signupUser() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const studentId = document.getElementById('signupStudentId').value;
  
  if (!name || !email || !password || !studentId) {
    document.getElementById('signupError').textContent = 'Please fill all fields';
    return;
  }
  
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    document.getElementById('signupError').textContent = 'Email already registered';
    return;
  }
  
  // Create new user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    studentId,
    joinDate: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  closeLoginModal();
  checkAuthStatus();
  alert('✅ Account created successfully!');

  if (currentBuyItem) {
    cart = [{
      ...currentBuyItem,
      id: Date.now()
    }];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    currentBuyItem = null;
    proceedToCheckout();
    return;
  }
}

// Logout user
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  checkAuthStatus();
  alert('✅ Logged out successfully!');
}

// Update cart count
function updateCartCount() {
  document.getElementById('cartCount').innerText = cart.length;
}

// Add to cart
function addToCart(item) {
  cart.push({
    ...item,
    id: Date.now()
  });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  alert('✅ ' + item.name + ' added to cart!');
  
  // Show cart after 1 second
  setTimeout(displayCart, 500);
}

function buyNow(item) {
  currentBuyItem = item;
  if (!currentUser) {
    openLoginModal();
    return;
  }

  cart = [{
    ...item,
    id: Date.now()
  }];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  proceedToCheckout();
}

// Remove from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

// Display cart
function displayCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p style="text-align:center; color:#999;">Your cart is empty</p>';
    document.getElementById('cartTotal').innerText = '0';
    return;
  }
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    total += item.price;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-seller">Seller: ${item.seller}</div>
        </div>
        <div class="cart-item-price">₹${item.price}</div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;
  });
  
  cartItemsDiv.innerHTML = html;
  document.getElementById('cartTotal').innerText = total;
}

// Open cart modal
function openCart() {
  document.getElementById('cartModal').style.display = 'block';
  displayCart();
}

// Close cart modal
function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert('❌ Your cart is empty!');
    return;
  }
  
  if (!currentUser) {
    openLoginModal();
    return;
  }
  
  proceedToCheckout();
}

// Proceed to checkout
function proceedToCheckout() {
  closeCart();
  document.getElementById('checkoutModal').style.display = 'block';
  displayCheckoutItems();
}

// Display checkout items
function displayCheckoutItems() {
  const checkoutItemsDiv = document.getElementById('checkoutItems');
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    total += item.price;
    html += `
      <div class="checkout-item">
        <div class="checkout-item-info">
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-seller">Seller: ${item.seller}</div>
        </div>
        <div class="checkout-item-price">₹${item.price}</div>
      </div>
    `;
  });
  
  checkoutItemsDiv.innerHTML = html;
  document.getElementById('checkoutTotal').innerText = total;
}

// Close checkout modal
function closeCheckoutModal() {
  document.getElementById('checkoutModal').style.display = 'none';
}

// Place order
function placeOrder() {
  // Validate delivery form
  const name = document.getElementById('deliveryName').value;
  const phone = document.getElementById('deliveryPhone').value;
  const address = document.getElementById('deliveryAddress').value;
  const time = document.getElementById('deliveryTime').value;
  
  if (!name || !phone || !address || !time) {
    alert('❌ Please fill all delivery information');
    return;
  }
  
  // Get payment method
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
  // Create order
  const order = {
    id: 'ORD' + Date.now(),
    user: currentUser,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price, 0),
    delivery: {
      name,
      phone,
      address,
      landmark: document.getElementById('deliveryLandmark').value,
      time
    },
    payment: paymentMethod,
    status: 'confirmed',
    orderDate: new Date().toISOString()
  };
  
  // Save order
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Close modal and show success
  closeCheckoutModal();
  alert(`✅ Order Placed Successfully!\n\nOrder ID: ${order.id}\nTotal: ₹${order.total}\n\nYour items will be delivered to ${address} at the selected time.`);
}

// ============================
// SELL FUNCTIONALITY
// ============================

// Open sell modal
function openSellModal() {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  document.getElementById('sellModal').style.display = 'block';
}

// Close sell modal
function closeSellModal() {
  document.getElementById('sellModal').style.display = 'none';
}

// Handle sell form submission
document.addEventListener('DOMContentLoaded', function() {
  const sellForm = document.getElementById('sellForm');
  if (sellForm) {
    sellForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!currentUser) {
        openLoginModal();
        return;
      }
      
      const itemFile = document.getElementById('itemImage').files[0];
      const defaultImage = 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80';
      const newListing = {
        id: Date.now(),
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDesc').value,
        price: parseInt(document.getElementById('itemPrice').value),
        condition: document.getElementById('itemCondition').value,
        category: document.getElementById('itemCategory').value,
        seller: currentUser.name,
        image: defaultImage
      };

      function saveListing() {
        userListings.push(newListing);
        localStorage.setItem('userListings', JSON.stringify(userListings));
        alert('✅ Item listed successfully!');
        sellForm.reset();
        closeSellModal();
        displayMyListings();
      }

      if (itemFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
          newListing.image = e.target.result || defaultImage;
          saveListing();
        };
        reader.readAsDataURL(itemFile);
      } else {
        saveListing();
      }
    });
  }
  
  // Edit form submission
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const listingId = parseInt(this.getAttribute('data-listing-id'));
      const listingIndex = userListings.findIndex(item => item.id === listingId);
      
      if (listingIndex === -1) {
        alert('❌ Listing not found');
        return;
      }
      
      // Update listing
      userListings[listingIndex] = {
        ...userListings[listingIndex],
        name: document.getElementById('editItemName').value,
        description: document.getElementById('editItemDesc').value,
        price: parseInt(document.getElementById('editItemPrice').value),
        condition: document.getElementById('editItemCondition').value,
        category: document.getElementById('editItemCategory').value
      };
      
      localStorage.setItem('userListings', JSON.stringify(userListings));
      
      alert('✅ Listing updated successfully!');
      
      closeEditModal();
      displayMyListings();
    });
  }
  
  // Display my listings on load
  displayMyListings();
  updateCartCount();
  
  // Initialize seller chat and AI chat
  initSellerChat();
  displayAIChat();
  
  // Check authentication status
  checkAuthStatus();
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    const sellModal = document.getElementById('sellModal');
    const cartModal = document.getElementById('cartModal');
    const loginModal = document.getElementById('loginModal');
    const editModal = document.getElementById('editModal');
    const checkoutModal = document.getElementById('checkoutModal');
    
    if (event.target === sellModal) {
      sellModal.style.display = 'none';
    }
    if (event.target === cartModal) {
      cartModal.style.display = 'none';
    }
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (event.target === editModal) {
      editModal.style.display = 'none';
    }
    if (event.target === checkoutModal) {
      checkoutModal.style.display = 'none';
    }
  };
});

// Display my listings
function displayMyListings() {
  const listingsDiv = document.getElementById('myListingsGrid');
  
  if (userListings.length === 0) {
    listingsDiv.innerHTML = '<p class="empty-msg">No items listed yet. Click "Sell Item" to get started!</p>';
    return;
  }
  
  let html = '';
  
  userListings.forEach(listing => {
    html += `
      <div class="product-card">
        <img src="${listing.image}" alt="${listing.name}">
        <span class="seller-badge">Your Listing</span>
        <h3>${listing.name}</h3>
        <p>${listing.description.substring(0, 50)}...</p>
        <p style="color:#666; font-size:12px;">Condition: ${listing.condition}</p>
        <h4>₹${listing.price}</h4>
        <div class="card-actions">
          <button class="buy-btn" onclick="editListing(${listing.id})">✏️ Edit</button>
          <button class="chat-btn" onclick="deleteListing(${listing.id})" style="background:#ef4444;">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
  
  listingsDiv.innerHTML = html;
}

// Delete listing
function deleteListing(id) {
  if (confirm('Are you sure you want to delete this listing?')) {
    userListings = userListings.filter(item => item.id !== id);
    localStorage.setItem('userListings', JSON.stringify(userListings));
    displayMyListings();
    alert('✅ Listing deleted!');
  }
}

// Edit listing (improved)
function editListing(id) {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  
  const listing = userListings.find(item => item.id === id);
  if (!listing) {
    alert('❌ Listing not found');
    return;
  }
  
  // Populate edit form
  document.getElementById('editItemName').value = listing.name;
  document.getElementById('editItemDesc').value = listing.description;
  document.getElementById('editItemPrice').value = listing.price;
  document.getElementById('editItemCondition').value = listing.condition;
  document.getElementById('editItemCategory').value = listing.category;
  
  // Store current listing ID
  document.getElementById('editForm').setAttribute('data-listing-id', id);
  
  document.getElementById('editModal').style.display = 'block';
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// ============================
// BUY BUTTON (Legacy)
// ============================

function buyItem(item) {
  alert(item + " added to cart!");
}

// ============================
// SCROLL
// ============================

function scrollToProducts() {

  document
    .getElementById("products")
    .scrollIntoView({
      behavior: "smooth"
    });

}

// ============================
// CONTACT SELLER
// ============================

function contactSeller(seller) {
  currentSeller = seller;
  localStorage.setItem('currentSeller', currentSeller);
  updateSellerChatHeader();
  displaySellerChat();

  if (!sellerChatHistory[currentSeller]) {
    sellerChatHistory[currentSeller] = [];
  }

  const intro = `You are now chatting with ${seller}. Type your question below and the seller will reply.`;
  if (sellerChatHistory[currentSeller].length === 0) {
    sellerChatHistory[currentSeller].push({
      text: intro,
      isSeller: false,
      timestamp: Date.now()
    });
    localStorage.setItem('sellerChatHistory', JSON.stringify(sellerChatHistory));
    displaySellerChat();
  }

  // Scroll to chat section
  document.getElementById('chat').scrollIntoView({
    behavior: 'smooth'
  });

  // Focus on chat input after a short delay
  setTimeout(() => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.focus();
  }, 400);
}

function updateSellerChatHeader() {
  const header = document.getElementById('sellerChatHeader');
  const chatInput = document.getElementById('chatInput');
  if (!header) return;
  if (currentSeller) {
    header.innerText = `Chat with Seller: ${currentSeller}`;
    if (chatInput) chatInput.placeholder = `Message ${currentSeller}...`;
  } else {
    header.innerText = 'Seller Chat: Select a product and click 💬 Contact';
    if (chatInput) chatInput.placeholder = 'Type message';
  }
}

function displaySellerChat() {
  const chatBox = document.getElementById('chatBox');
  const chatInput = document.getElementById('chatInput');
  if (!chatBox) return;
  chatBox.innerHTML = '';

  if (!currentSeller) {
    if (chatInput) chatInput.value = '';
    const defaultMessage = document.createElement('div');
    defaultMessage.classList.add('message');
    defaultMessage.innerText = 'Select a product and click 💬 Contact to chat with the seller.';
    chatBox.appendChild(defaultMessage);
    return;
  }

  const history = sellerChatHistory[currentSeller] || [];
  if (history.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('message');
    emptyMessage.innerText = `No messages yet with ${currentSeller}. Start the conversation!`;
    chatBox.appendChild(emptyMessage);
  } else {
    history.forEach(entry => {
      const div = document.createElement('div');
      div.classList.add('message');
      div.style.background = entry.isSeller ? '#d1fae5' : '#e2e8f0';
      div.innerText = entry.isSeller ? `${currentSeller}: ${entry.text}` : `You: ${entry.text}`;
      chatBox.appendChild(div);
    });
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function sellerAutoReply(seller, message) {
  const lower = message.toLowerCase();
  if (lower.includes('price')) {
    return `Hi! I can offer this still at the listed price. Let me know if you want to buy now.`;
  }
  if (lower.includes('meet') || lower.includes('pickup') || lower.includes('delivery')) {
    return `Sure! We can meet on campus tomorrow afternoon. What time works best for you?`;
  }
  if (lower.includes('condition') || lower.includes('used') || lower.includes('quality')) {
    return `It is in good condition. I have used it carefully and it works perfectly.`;
  }
  return `Thanks for asking! I will get back to you with the exact details shortly.`;
}

// Initialize seller chat
function initSellerChat() {
  currentSeller = localStorage.getItem('currentSeller') || currentSeller;
  updateSellerChatHeader();
  displaySellerChat();
}


// ============================
// AI CHATBOT WITH HISTORY
// ============================

let aiChatHistory = JSON.parse(localStorage.getItem('aiChatHistory')) || [];

// Display chat history
function displayAIChat() {
  const chatHistory = document.getElementById('aiChatHistory');
  
  // Clear existing messages except welcome
  const welcomeMessage = chatHistory.querySelector('.ai-welcome');
  chatHistory.innerHTML = '';
  if (welcomeMessage) {
    chatHistory.appendChild(welcomeMessage);
  }
  
  // Add chat history
  aiChatHistory.forEach(message => {
    addMessageToChat(message.text, message.isUser, message.timestamp);
  });
  
  // Scroll to bottom
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Add message to chat
function addMessageToChat(text, isUser = false, timestamp = null) {
  const chatHistory = document.getElementById('aiChatHistory');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${isUser ? 'user' : ''}`;
  
  const avatar = isUser ? '👤' : '🤖';
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
      ${timeString ? `<div class="message-time">${timeString}</div>` : ''}
    </div>
  `;
  
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const chatHistory = document.getElementById('aiChatHistory');
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-message typing-indicator';
  typingDiv.id = 'typingIndicator';
  
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      AI is typing...
    </div>
  `;
  
  chatHistory.appendChild(typingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Send message to AI
async function sendMessageToAI() {
  const input = document.getElementById('interestInput');
  const message = input.value.trim();
  
  if (!message) {
    return;
  }
  
  // Add user message to chat
  const timestamp = Date.now();
  addMessageToChat(message, true, timestamp);
  
  // Save to history
  aiChatHistory.push({
    text: message,
    isUser: true,
    timestamp: timestamp
  });
  
  // Clear input
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Get AI response
    const aiResponse = await getAIResponse(message);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Add AI response to chat
    const aiTimestamp = Date.now();
    addMessageToChat(aiResponse, false, aiTimestamp);
    
    // Save to history
    aiChatHistory.push({
      text: aiResponse,
      isUser: false,
      timestamp: aiTimestamp
    });
    
    // Save to localStorage
    localStorage.setItem('aiChatHistory', JSON.stringify(aiChatHistory));
    
  } catch (error) {
    hideTypingIndicator();
    const fallback = generateFallbackAIResponse(message);
    addMessageToChat(fallback, false, Date.now());
    console.warn('AI Error:', error);
  }
}

// Get AI response with chat history and item suggestions
async function getAIResponse(userMessage) {
  // Prepare conversation history for context
  let conversationContext = `You are a fast, friendly campus marketplace AI assistant like ChatGPT or Google Gemini.

Your tasks:
- Recommend the best products for the student's need
- Suggest books, gadgets, and campus essentials
- Give 2-3 concise options with seller names and prices
- Use short paragraphs or bullet lists when helpful
- Keep answers efficient, polite, and actionable
- Mention that users can contact sellers by clicking the 💬 Contact button
- Remember recent conversation context

`;
  
  // Add recent conversation history (last 10 messages for context)
  const recentHistory = aiChatHistory.slice(-10);
  if (recentHistory.length > 0) {
    conversationContext += "\nRecent conversation:\n";
    recentHistory.forEach(msg => {
      const role = msg.isUser ? "User" : "Assistant";
      conversationContext += `${role}: ${msg.text}\n`;
    });
    conversationContext += "\n";
  }
  
  conversationContext += `Current User Question: ${userMessage}`;
  
  let data;
  let response;
  try {
    response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: conversationContext
            }]
          }]
        })
      }
    );
  } catch (fetchError) {
    console.warn('AI fetch failed', fetchError);
    return generateFallbackAIResponse(userMessage);
  }

  try {
    data = await response.json();
  } catch (parseError) {
    console.warn('AI response parse failed', parseError);
    return generateFallbackAIResponse(userMessage);
  }

  if (!response.ok || data?.error) {
    console.warn('AI API error', data?.error || response.statusText);
    return generateFallbackAIResponse(userMessage);
  }

  let aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!aiResponse) {
    return generateFallbackAIResponse(userMessage);
  }
  
  // Check if user is asking about specific items and add related suggestions
  const relatedItems = findRelatedItems(userMessage.toLowerCase());
  if (relatedItems.length > 0) {
    aiResponse += "\n\n📦 Related items available in our marketplace:\n";
    relatedItems.forEach(item => {
      aiResponse += `• ${item.name} - ₹${item.price} (Seller: ${item.seller})\n`;
    });
    aiResponse += "\n💡 Use the 💬 Contact button on a product to message the seller directly.";
  }

  aiResponse = normalizeAIResponse(aiResponse);
  return aiResponse;
}

function normalizeAIResponse(text) {
  if (!text) return text;
  let result = text.trim().replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  if (result.length > 900) {
    const lines = result.split('\n').slice(0, 8);
    result = lines.join('\n').trim();
    if (result.length > 900) {
      result = result.slice(0, 900).trim();
    }
    result += "\n\nIf you want, I can also help you contact a seller or add items to your cart.";
  }
  return result;
}

// Find related items based on user query
function findRelatedItems(query) {
  // Define available items (this would ideally come from a database)
  const allItems = [
    // Science Books
    {name: 'University Physics', price: 450, seller: 'Alex', category: 'book', keywords: ['physics', 'science', 'university', 'engineering']},
    {name: 'Organic Chemistry', price: 380, seller: 'Priya', category: 'book', keywords: ['chemistry', 'organic', 'science', 'lab']},
    {name: 'Campbell Biology', price: 520, seller: 'Rohan', category: 'book', keywords: ['biology', 'science', 'life science', 'medical']},
    {name: 'Calculus by Stewart', price: 420, seller: 'Lisa', category: 'book', keywords: ['math', 'calculus', 'mathematics', 'engineering']},
    {name: 'Introduction to Quantum Mechanics', price: 480, seller: 'David', category: 'book', keywords: ['physics', 'quantum', 'mechanics', 'advanced']},
    {name: 'Thermodynamics', price: 460, seller: 'Maria', category: 'book', keywords: ['physics', 'thermodynamics', 'engineering', 'heat']},
    {name: 'Physical Chemistry', price: 500, seller: 'Kevin', category: 'book', keywords: ['chemistry', 'physical', 'science', 'lab']},
    {name: 'Molecular Biology of the Gene', price: 550, seller: 'Sarah', category: 'book', keywords: ['biology', 'molecular', 'genetics', 'dna']},
    {name: 'Linear Algebra and Its Applications', price: 430, seller: 'Tom', category: 'book', keywords: ['math', 'algebra', 'linear', 'mathematics']},
    {name: 'Introduction to Electrodynamics', price: 470, seller: 'Nina', category: 'book', keywords: ['physics', 'electrodynamics', 'electricity', 'magnetism']},
    
    // Electronics
    {name: 'iPhone 12', price: 35000, seller: 'Raj', category: 'electronics', keywords: ['phone', 'iphone', 'mobile', 'smartphone']},
    {name: 'AirPods Pro', price: 18000, seller: 'Maya', category: 'electronics', keywords: ['earbuds', 'airpods', 'audio', 'wireless']},
    {name: 'Apple Watch Series 7', price: 25000, seller: 'Arjun', category: 'electronics', keywords: ['watch', 'apple watch', 'smartwatch', 'fitness']},
    {name: 'iPad Air', price: 32000, seller: 'Karan', category: 'electronics', keywords: ['tablet', 'ipad', 'apple', 'device']},
    {name: 'JBL GO 3 Speaker', price: 2500, seller: 'Priya', category: 'electronics', keywords: ['speaker', 'jbl', 'audio', 'bluetooth']},
    {name: 'Mi Power Bank 20000mAh', price: 1200, seller: 'Vikram', category: 'electronics', keywords: ['power bank', 'charger', 'battery', 'mi']},
    {name: 'Wireless Charging Pad', price: 800, seller: 'Anjali', category: 'electronics', keywords: ['charger', 'wireless', 'charging', 'pad']},
    {name: 'Mi Smart Band 6', price: 1800, seller: 'Rohit', category: 'electronics', keywords: ['smart band', 'fitness', 'tracker', 'mi']},
    {name: 'HyperX Cloud Stinger', price: 3500, seller: 'Deepak', category: 'electronics', keywords: ['headset', 'gaming', 'hyperx', 'audio']},
    {name: 'USB-C Hub', price: 1500, seller: 'Sneha', category: 'electronics', keywords: ['hub', 'usb-c', 'adapter', 'multiport']},
    
    // Daily Use Items
    {name: 'LG Double Door Fridge', price: 15000, seller: 'Amit', category: 'appliance', keywords: ['fridge', 'refrigerator', 'lg', 'appliance']},
    {name: 'Split AC 1.5 Ton', price: 28000, seller: 'Pooja', category: 'appliance', keywords: ['ac', 'air conditioner', 'cooling', 'appliance']},
    {name: 'Semi-Automatic Washing Machine', price: 8500, seller: 'Rahul', category: 'appliance', keywords: ['washing machine', 'laundry', 'appliance', 'washer']},
    {name: 'Water Cooler', price: 6500, seller: 'Meera', category: 'appliance', keywords: ['water cooler', 'drinking water', 'hot cold', 'appliance']},
    {name: 'Crompton Ceiling Fan', price: 1800, seller: 'Suresh', category: 'appliance', keywords: ['fan', 'ceiling fan', 'cooling', 'appliance']},
    {name: 'Microwave Oven', price: 7200, seller: 'Kavita', category: 'appliance', keywords: ['microwave', 'oven', 'cooking', 'appliance']},
    {name: 'Gas Stove', price: 3200, seller: 'Ramesh', category: 'appliance', keywords: ['gas stove', 'cooking', 'burner', 'appliance']},
    {name: 'Air Purifier', price: 12000, seller: 'Neha', category: 'appliance', keywords: ['air purifier', 'clean air', 'hepa', 'appliance']},
    {name: 'Room Heater', price: 2800, seller: 'Vijay', category: 'appliance', keywords: ['heater', 'room heater', 'heating', 'appliance']},
    {name: 'Vacuum Cleaner', price: 4500, seller: 'Sunita', category: 'appliance', keywords: ['vacuum', 'cleaner', 'cleaning', 'appliance']}
  ];
  
  // Find items that match the query keywords
  const matchingItems = allItems.filter(item => {
    return item.keywords.some(keyword => query.includes(keyword)) ||
           item.name.toLowerCase().includes(query) ||
           item.category.toLowerCase().includes(query);
  });
  
  // Return up to 3 related items
  return matchingItems.slice(0, 3);
}

function generateFallbackAIResponse(userMessage) {
  const suggestions = findRelatedItems(userMessage.toLowerCase());
  let response = `I am here to help with campus marketplace questions. `;
  if (suggestions.length > 0) {
    response += `I found some items that match your request:`;
    suggestions.forEach(item => {
      response += `\n• ${item.name} - ₹${item.price} (Seller: ${item.seller})`;
    });
    response += `\nYou can add them to cart or message the seller using the 💬 Contact button.`;
  } else {
    response += `Tell me more about what you need, such as books, gadgets, or school supplies.`;
  }
  return response;
}

// Handle Enter key press
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessageToAI();
  }
}

// Clear AI chat
function clearAIChat() {
  if (confirm('Are you sure you want to clear the chat history?')) {
    aiChatHistory = [];
    localStorage.removeItem('aiChatHistory');
    displayAIChat();
  }
}

// Legacy function (keeping for compatibility)
async function getRecommendation() {
  sendMessageToAI();
}

// ============================
// PRICE PREDICTION
// ============================

function predictPrice() {

  const condition =
    document.getElementById("condition").value;

  const demand =
    document.getElementById("demand").value;

  let price = 500;

  if (condition === "new") {
    price += 1000;
  }

  else if (condition === "good") {
    price += 500;
  }

  else {
    price += 100;
  }

  if (demand === "high") {
    price += 700;
  }

  else if (demand === "medium") {
    price += 300;
  }

  else {
    price += 50;
  }

  document.getElementById("priceResult")
    .innerHTML =
    "💰 Predicted Fair Price: ₹" + price;

}

// ============================
// CHAT
// ============================

function sendMessage() {
  const input = document.getElementById('chatInput');
  const chatBox = document.getElementById('chatBox');
  const message = input.value.trim();

  if (!message) {
    return;
  }

  if (!currentSeller) {
    alert('Please select a seller by clicking the 💬 Contact button on a product.');
    return;
  }

  if (!sellerChatHistory[currentSeller]) {
    sellerChatHistory[currentSeller] = [];
  }

  sellerChatHistory[currentSeller].push({
    text: message,
    isSeller: false,
    timestamp: Date.now()
  });

  input.value = '';
  displaySellerChat();
  localStorage.setItem('sellerChatHistory', JSON.stringify(sellerChatHistory));

  setTimeout(() => {
    const reply = sellerAutoReply(currentSeller, message);
    sellerChatHistory[currentSeller].push({
      text: reply,
      isSeller: true,
      timestamp: Date.now()
    });
    localStorage.setItem('sellerChatHistory', JSON.stringify(sellerChatHistory));
    displaySellerChat();
  }, 900);
}

// Handle Enter key press for seller chat
function handleSellerChatKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
}

function initSellerChat() {
  currentSeller = localStorage.getItem('currentSeller') || currentSeller;
  updateSellerChatHeader();
  displaySellerChat();
}
