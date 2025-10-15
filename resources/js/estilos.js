document.addEventListener('DOMContentLoaded', () => {
    // --- NAVEGACIÓN Y SCROLL ---
    const menuLinks = document.querySelectorAll('.menu-nav-link');
    const sections = document.querySelectorAll('section[id]');
    const verifyButton = document.getElementById('verify-button');

    function highlightMenuLink() {
        let scrollPosition = window.scrollY || window.pageYOffset;
        let currentSection = null;
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop - 150 && scrollPosition < section.offsetTop + section.offsetHeight - 150) {
                currentSection = section;
            }
        });
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSection && link.getAttribute('href') === `#${currentSection.id}`) {
                link.classList.add('active');
            }
        });
    }

    if (verifyButton) {
        verifyButton.addEventListener('click', () => {
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    window.addEventListener('scroll', highlightMenuLink);

    // --- ANIMACIONES DE SCROLL ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    // --- LÓGICA DEL CARRITO DE COMPRAS ---
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartShippingEl = document.getElementById('cart-shipping');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    let cart = [];
    const shippingCost = 50;
    const freeShippingThreshold = 400;

    cartButton.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartModal.addEventListener('click', (e) => { if (e.target === cartModal) toggleCart(); });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart({ name, price });
        });
    });
    
    cartItemsContainer.addEventListener('click', e => {
        const target = e.target.closest('.quantity-change');
        if (target) {
            const name = target.dataset.name;
            const change = parseInt(target.dataset.change);
            updateQuantity(name, change);
        }
    });

    function toggleCart() { cartModal.classList.toggle('hidden'); }

    function addToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) existingItem.quantity++;
        else cart.push({ ...item, quantity: 1 });
        updateCart();
    }

    function updateQuantity(name, change) {
        const item = cart.find(cartItem => cartItem.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) cart = cart.filter(cartItem => cartItem.name !== name);
        }
        updateCart();
    }

    function updateCart() {
        renderCartItems();
        updateCartTotals();
        updateCartCount();
    }
    
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center mb-4 text-white';
                itemEl.innerHTML = `
                    <div>
                        <h4 class="font-semibold">${item.name}</h4>
                        <p class="text-gray-400">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button class="quantity-change text-lg font-bold p-1 rounded-full bg-gray-600 hover:bg-gray-500" data-name="${item.name}" data-change="-1">-</button>
                        <span class="w-8 text-center">${item.quantity}</span>
                        <button class="quantity-change text-lg font-bold p-1 rounded-full bg-gray-600 hover:bg-gray-500" data-name="${item.name}" data-change="1">+</button>
                    </div>`;
                cartItemsContainer.appendChild(itemEl);
            });
        }
    }

    function updateCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? shippingCost : 0;
        const total = subtotal + shipping;
        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        cartShippingEl.textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis';
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
    }
    
    function updateCartCount() {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            const phoneNumber = "524771234567";
            let message = "¡Hola! Quisiera hacer el siguiente pedido de Onigiri:\n\n";
            cart.forEach(item => { message += `- ${item.quantity}x ${item.name}\n`; });
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? shippingCost : 0;
            const total = subtotal + shipping;
            message += `\n*Total:* $${total.toFixed(2)}\n\n¡Muchas gracias!`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    updateCart();

    // --- LÓGICA DEL RECOMENDADOR DE IA (GEMINI) ---
    const geminiModal = document.getElementById('gemini-recommender-modal');
    const openGeminiBtn = document.getElementById('gemini-recommender-btn');
    const closeGeminiBtn = document.getElementById('close-gemini-modal-btn');
    const getRecommendationBtn = document.getElementById('get-recommendation-btn');
    const cravingInput = document.getElementById('craving-input');
    const resultContainer = document.getElementById('gemini-recommendation-result');
    const loadingIndicator = document.getElementById('gemini-loading');
    const contentContainer = document.getElementById('gemini-recommendation-content');
    const examplePrompts = document.querySelectorAll('.example-prompt');

    examplePrompts.forEach(button => {
        button.addEventListener('click', () => {
            cravingInput.value = button.textContent;
            getRecommendationBtn.click();
        });
    });
    
    const openGeminiModal = () => {
        geminiModal.classList.remove('hidden');
        geminiModal.classList.add('flex');
    }

    const closeGeminiModal = () => {
        geminiModal.classList.add('hidden');
        geminiModal.classList.remove('flex');
        cravingInput.value = '';
        contentContainer.innerHTML = '';
        resultContainer.style.display = 'none';
    };
    
    openGeminiBtn.addEventListener('click', openGeminiModal);
    closeGeminiBtn.addEventListener('click', closeGeminiModal);

    getRecommendationBtn.addEventListener('click', async () => {
        const craving = cravingInput.value.trim();
        if (!craving) {
            contentContainer.innerHTML = '<p class="text-red-500">Por favor, describe tu antojo.</p>';
            return;
        }

        resultContainer.style.display = 'block';
        loadingIndicator.style.display = 'flex';
        contentContainer.innerHTML = '';
        
        try {
            const menuItems = Array.from(document.querySelectorAll('.menu-item')).map(item => {
               const name = item.querySelector('.item-name').textContent;
               const desc = item.querySelector('.item-desc').textContent;
               return `- ${name}: ${desc}`;
            }).join('\n');

            const systemPrompt = "Eres un asistente culinario amigable y experto para el restaurante de comida japonesa 'Onigiri'. Tu objetivo es ayudar a los clientes a elegir el platillo perfecto de nuestro menú basándote en sus antojos. Sé conciso, amigable y haz que tus recomendaciones suenen deliciosas. Siempre responde en español y usa un formato simple con un encabezado para el platillo y un párrafo de descripción.";
            const userQuery = `Este es nuestro menú:\n${menuItems}\n\nUn cliente dice que tiene antojo de "${craving}". Basado en el menú, ¿qué platillo o platillos le recomendarías? Describe brevemente por qué es una buena elección para su antojo.`;

            const apiKey = "AIzaSyAwXxePutLypJUmE2QZG-oSixOBtBeRJEI"; // API Key agregada
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
            
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error en la API: ${errorData.error.message}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
                let htmlContent = text.replace(/\*\*(.*?)\*\*/g, '<h4 class="text-lg font-bold mb-2">$1</h4>').replace(/\n/g, '<br>'); 
                contentContainer.innerHTML = htmlContent;
            } else {
                throw new Error("No se recibió una respuesta válida de la IA.");
            }

        } catch (error) {
            console.error("Error al obtener recomendación:", error);
            contentContainer.innerHTML = `<p class="text-red-500">Lo sentimos, ocurrió un error. Puede ser un problema con la API Key o la conexión. Revisa la consola para más detalles.</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });
});

