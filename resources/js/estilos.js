document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DEL MENÚ MÓVIL ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            // Se usa una clase 'open' para controlar la animación
            mobileMenu.classList.toggle('open');
            mobileMenuButton.classList.toggle('open');
        });
    }

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('open');
        });
    });

    // --- NAVEGACIÓN Y SCROLL ---
    const menuLinks = document.querySelectorAll('.menu-nav-link');
    const sections = document.querySelectorAll('section[id]');
    const verifyButton = document.getElementById('verify-button');
    const addressInput = document.getElementById('address-input');
    const addressStatus = document.getElementById('address-status');

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
            
            // Clear previous message and animations
            addressStatus.innerHTML = '';
            addressStatus.classList.remove('fade-in', 'fade-out');

            if (addressInput.value.trim() === '') {
                addressStatus.innerHTML = `
                    <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>Por favor, ingresa una dirección.</span>`;
                addressStatus.classList.add('fade-in');
                
                setTimeout(() => {
                    addressStatus.classList.add('fade-out');
                    setTimeout(() => addressStatus.innerHTML = '', 500);
                }, 3000);
                return;
            }

            addressStatus.innerHTML = `
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>¡Confirmado! Tenemos cobertura. Redirigiendo al menú...</span>`;
            addressStatus.classList.add('text-green-400', 'fade-in');

            setTimeout(() => {
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1500);

            setTimeout(() => {
                addressStatus.classList.add('fade-out');
                setTimeout(() => addressStatus.innerHTML = '', 500);
            }, 4000);
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
                        <button class="quantity-change text-lg font-bold p-1 rounded-full bg-gray-600 hover:bg-gray-500" data-name="${item.name}" data-change="-1" aria-label="Disminuir cantidad de ${item.name}">-</button>
                        <span class="w-8 text-center" aria-live="polite">${item.quantity}</span>
                        <button class="quantity-change text-lg font-bold p-1 rounded-full bg-gray-600 hover:bg-gray-500" data-name="${item.name}" data-change="1" aria-label="Aumentar cantidad de ${item.name}">+</button>
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
            const phoneNumber = "524777603835";
            
            let message = "🍣 *¡Hola, Onigiri!* 🍜\n\nQuisiera hacer el siguiente pedido:\n\n";
            message += "*--- MI PEDIDO ---*\n";
            cart.forEach(item => {
                message += `- ${item.quantity}x ${item.name}\n`;
            });
            
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? shippingCost : 0;
            const total = subtotal + shipping;
            
            message += "\n*--- RESUMEN ---*\n";
            message += `*Subtotal:* $${subtotal.toFixed(2)}\n`;
            message += `*Envío:* ${shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis'}\n`;
            message += `*Total a pagar:* *$${total.toFixed(2)}*\n\n`;
            message += "¡Muchas gracias! Quedo a la espera de la confirmación. 👍";

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
        setTimeout(() => {
            geminiModal.classList.add('open');
        }, 10);
    }

    const closeGeminiModal = () => {
        geminiModal.classList.remove('open');
        setTimeout(() => {
            geminiModal.classList.add('hidden');
            geminiModal.classList.remove('flex');
            cravingInput.value = '';
            contentContainer.innerHTML = '';
            resultContainer.style.display = 'none';
        }, 300); // Coincide con la duración de la transición en CSS
    };
    
    openGeminiBtn.addEventListener('click', openGeminiModal);
    closeGeminiBtn.addEventListener('click', closeGeminiModal);

    getRecommendationBtn.addEventListener('click', async () => {
        const craving = cravingInput.value.trim();
        if (!craving) {
            contentContainer.innerHTML = '<p class="text-red-500">Por favor, describe tu antojo.</p>';
            resultContainer.style.display = 'block';
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

            const apiKey = "AIzaSyAwXxePutLypJUmE2QZG-oSixOBtBeRJEI"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

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
            contentContainer.innerHTML = `<p class="text-red-500">Lo sentimos, ocurrió un error. Puede que la API Key no sea válida o haya un problema de conexión.</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    // --- LÓGICA DEL FORMULARIO DE CONTACTO ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            
            formStatus.innerHTML = '<p class="text-blue-400">Enviando mensaje...</p>';

            try {
                // RECUERDA: Reemplaza "YOUR_UNIQUE_ID" con tu ID de Formspree.
                const response = await fetch("https://formspree.io/f/YOUR_UNIQUE_ID", {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.innerHTML = '<p class="text-green-400">¡Mensaje enviado con éxito!</p>';
                    form.reset();
                } else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        const errorMessages = responseData.errors.map(error => error.message).join(', ');
                        throw new Error(errorMessages);
                    } else {
                        throw new Error('Hubo un problema al enviar el formulario.');
                    }
                }
            } catch (error) {
                console.error('Error en el formulario:', error);
                formStatus.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
            } finally {
                setTimeout(() => {
                    formStatus.innerHTML = '';
                }, 5000);
            }
        });
    }
});

