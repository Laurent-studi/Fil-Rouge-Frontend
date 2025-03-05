document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const maxCouverts = 50; // Nombre maximum de couverts pour le restaurant
    let availableSlots = {}; // Stockage des créneaux disponibles

    // Gestion du menu de navigation responsive
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Effet de scroll pour le header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Gestion des onglets du menu
    const menuTabs = document.querySelectorAll('.menu-tab');
    
    if (menuTabs.length > 0) {
        menuTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Retirer la classe active de tous les onglets
                menuTabs.forEach(t => t.classList.remove('active'));
                // Ajouter la classe active à l'onglet cliqué
                this.classList.add('active');
                
                // Masquer toutes les catégories
                const categories = document.querySelectorAll('.menu-category');
                categories.forEach(cat => cat.classList.remove('active'));
                
                // Afficher la catégorie correspondante
                const target = this.getAttribute('data-target');
                document.getElementById(target).classList.add('active');
            });
        });
    }

    // Gestion du modal de connexion
    const connexionModal = document.getElementById('connexion-modal');
    const btnConnexion = document.querySelector('.btn-connexion');
    const closeButtons = document.querySelectorAll('.close');
    const modalTabs = document.querySelectorAll('.modal-tab');
    const modalForms = document.querySelectorAll('.modal-form');

    // Ouvrir le modal
    btnConnexion.addEventListener('click', function(e) {
        e.preventDefault();
        connexionModal.style.display = 'block';
    });

    // Fermer le modal
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            connexionModal.style.display = 'none';
        });
    });

    // Fermer le modal en cliquant en dehors
    window.addEventListener('click', function(e) {
        if (e.target === connexionModal) {
            connexionModal.style.display = 'none';
        }
    });

    // Gestion des onglets du modal
    modalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Désactiver tous les onglets et formulaires
            modalTabs.forEach(t => t.classList.remove('active'));
            modalForms.forEach(f => f.classList.remove('active'));
            
            // Activer l'onglet et le formulaire sélectionnés
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('form-login');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Vérifier si c'est l'admin
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (admin && admin.email === email && admin.password === password) {
            const adminUser = {
                ...admin,
                firstname: admin.prenom,
                lastname: admin.nom,
                isAdmin: true
            };
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            window.location.href = 'admin.html';
            return;
        }

        // Vérifier les utilisateurs normaux
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            const normalUser = {
                ...user,
                isAdmin: false
            };
            localStorage.setItem('currentUser', JSON.stringify(normalUser));
            showNotification('Connexion réussie', 'success');
            connexionModal.style.display = 'none';
            updateLoginStatus();
        } else {
            showNotification('Email ou mot de passe incorrect', 'error');
        }
    });

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('form-register');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newUser = {
            firstname: document.getElementById('register-firstname').value,
            lastname: document.getElementById('register-lastname').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            defaultCouverts: document.getElementById('register-couverts').value,
            allergies: document.getElementById('register-allergies').value
        };

        // Vérifier si l'email existe déjà
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === newUser.email)) {
            showNotification('Cet email est déjà utilisé', 'error');
            return;
        }

        // Ajouter le nouvel utilisateur
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showNotification('Inscription réussie', 'success');
        connexionModal.style.display = 'none';
        
        // Connecter automatiquement l'utilisateur
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateLoginStatus();
    });

    // Fonction pour mettre à jour l'affichage selon le statut de connexion
    function updateLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const btnConnexion = document.querySelector('.btn-connexion');
        
        if (currentUser) {
            // Supprimer l'ancien menu déroulant s'il existe
            const oldDropdown = document.querySelector('.dropdown-menu');
            if (oldDropdown) {
                oldDropdown.remove();
            }
            
            if (currentUser.isAdmin) {
                btnConnexion.textContent = `${currentUser.prenom} ${currentUser.nom} (Admin)`;
            } else {
                btnConnexion.textContent = `${currentUser.firstname} ${currentUser.lastname}`;
            }
            
            // Ajouter le menu déroulant pour la déconnexion
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            dropdownMenu.innerHTML = `
                <ul>
                    ${currentUser.isAdmin ? '<li><a href="admin.html">Administration</a></li>' : ''}
                    <li><a href="#" id="logout-link">Déconnexion</a></li>
                </ul>
            `;
            
            btnConnexion.appendChild(dropdownMenu);
            
            // Gérer la déconnexion
            document.getElementById('logout-link').addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                location.href = 'index.html';
            });
            
            // Afficher/masquer le menu au clic
            btnConnexion.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Masquer le menu au clic en dehors
            document.addEventListener('click', function(e) {
                if (!btnConnexion.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        } else {
            btnConnexion.textContent = 'Connexion';
            btnConnexion.onclick = function(e) {
                e.preventDefault();
                connexionModal.style.display = 'block';
            };
        }
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Initialiser le statut de connexion au chargement
    updateLoginStatus();

    // Gestion du formulaire de réservation
    const reservationForm = document.getElementById('reservation-form');
    const dateInput = document.getElementById('date');
    const heureSelect = document.getElementById('heure');
    
    if (reservationForm && dateInput && heureSelect) {
        // Définir la date minimale à aujourd'hui
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        
        // Générer les horaires disponibles
        function generateTimeSlots(date) {
            // Vider le select des horaires
            heureSelect.innerHTML = '<option value="">Sélectionnez</option>';
            
            // Définir les horaires d'ouverture (à remplacer par des données dynamiques)
            const openingHours = {
                lunch: { start: '12:00', end: '14:00' },
                dinner: { start: '19:00', end: '21:00' }
            };
            
            // Convertir les heures en minutes pour faciliter les calculs
            const lunchStartMinutes = convertTimeToMinutes(openingHours.lunch.start);
            const lunchEndMinutes = convertTimeToMinutes(openingHours.lunch.end);
            const dinnerStartMinutes = convertTimeToMinutes(openingHours.dinner.start);
            const dinnerEndMinutes = convertTimeToMinutes(openingHours.dinner.end);
            
            // Générer les créneaux par tranches de 15 minutes
            // Déjeuner
            for (let minutes = lunchStartMinutes; minutes <= lunchEndMinutes; minutes += 15) {
                const timeString = convertMinutesToTime(minutes);
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = timeString;
                
                // Vérifier si le créneau est disponible
                const dateString = dateInput.value;
                const slotKey = `${dateString}-${timeString}`;
                
                if (availableSlots[slotKey] && availableSlots[slotKey] >= maxCouverts) {
                    option.disabled = true;
                    option.textContent += ' (Complet)';
                }
                
                heureSelect.appendChild(option);
            }
            
            // Séparateur
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '-------------------';
            heureSelect.appendChild(separator);
            
            // Dîner
            for (let minutes = dinnerStartMinutes; minutes <= dinnerEndMinutes; minutes += 15) {
                const timeString = convertMinutesToTime(minutes);
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = timeString;
                
                // Vérifier si le créneau est disponible
                const dateString = dateInput.value;
                const slotKey = `${dateString}-${timeString}`;
                
                if (availableSlots[slotKey] && availableSlots[slotKey] >= maxCouverts) {
                    option.disabled = true;
                    option.textContent += ' (Complet)';
                }
                
                heureSelect.appendChild(option);
            }
        }
        
        // Convertir une heure au format HH:MM en minutes
        function convertTimeToMinutes(timeString) {
            const [hours, minutes] = timeString.split(':').map(Number);
            return hours * 60 + minutes;
        }
        
        // Convertir des minutes en heure au format HH:MM
        function convertMinutesToTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
        
        // Mettre à jour les horaires disponibles lorsque la date change
        dateInput.addEventListener('change', function() {
            if (this.value) {
                generateTimeSlots(this.value);
            } else {
                heureSelect.innerHTML = '<option value="">Sélectionnez</option>';
            }
        });
        
        // Gestion de la soumission du formulaire de réservation
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier si l'utilisateur est connecté
            const currentUser = localStorage.getItem('currentUser');
            
            if (!currentUser) {
                // Afficher la modal de connexion
                connexionModal.style.display = 'block';
                
                // Afficher un message
                const reservationMessage = document.getElementById('reservation-message');
                reservationMessage.textContent = 'Veuillez vous connecter ou vous inscrire pour réserver une table.';
                reservationMessage.classList.add('error');
                reservationMessage.style.display = 'block';
                
                return;
            }
            
            // Récupérer les valeurs du formulaire
            const couverts = document.getElementById('couverts').value;
            const date = document.getElementById('date').value;
            const heure = document.getElementById('heure').value;
            const allergies = document.getElementById('allergies').value;
            
            // Vérifier que tous les champs sont remplis
            if (!couverts || !date || !heure) {
                const reservationMessage = document.getElementById('reservation-message');
                reservationMessage.textContent = 'Veuillez remplir tous les champs obligatoires.';
                reservationMessage.classList.add('error');
                reservationMessage.style.display = 'block';
                return;
            }
            
            // Vérifier la disponibilité
            const slotKey = `${date}-${heure}`;
            
            // Si le créneau n'existe pas encore, l'initialiser
            if (!availableSlots[slotKey]) {
                availableSlots[slotKey] = 0;
            }
            
            // Vérifier si l'ajout des couverts dépasse la capacité maximale
            if (availableSlots[slotKey] + parseInt(couverts) > maxCouverts) {
                const reservationMessage = document.getElementById('reservation-message');
                reservationMessage.textContent = 'Désolé, il n\'y a pas assez de places disponibles pour ce créneau.';
                reservationMessage.classList.add('error');
                reservationMessage.style.display = 'block';
                return;
            }
            
            // Simuler l'enregistrement de la réservation
            console.log('Réservation pour', couverts, 'personnes le', date, 'à', heure);
            
            // Mettre à jour les places disponibles
            availableSlots[slotKey] += parseInt(couverts);
            
            // Stocker la réservation dans le localStorage
            const user = JSON.parse(currentUser);
            
            // Récupérer les réservations existantes ou initialiser un tableau vide
            const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            
            // Ajouter la nouvelle réservation
            reservations.push({
                id: Date.now(), // Utiliser le timestamp comme identifiant unique
                userId: user.email,
                couverts: couverts,
                date: date,
                heure: heure,
                allergies: allergies
            });
            
            // Sauvegarder les réservations
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            // Afficher un message de confirmation
            const reservationMessage = document.getElementById('reservation-message');
            reservationMessage.textContent = 'Votre réservation a été enregistrée avec succès !';
            reservationMessage.classList.remove('error');
            reservationMessage.classList.add('success');
            reservationMessage.style.display = 'block';
            
            // Réinitialiser le formulaire
            reservationForm.reset();
            
            // Mettre à jour les horaires disponibles
            generateTimeSlots(date);
        });
    }

    // Fonction pour charger les plats depuis une API (simulée ici)
    function loadDishes() {
        // Simulation de données (à remplacer par un appel API)
        const dishes = {
            entrees: [
                {
                    title: 'Velouté de potimarron',
                    description: 'Velouté onctueux de potimarron de Savoie, crème fraîche et éclats de noisettes torréfiées',
                    price: '12€'
                },
                {
                    title: 'Tartare de truite',
                    description: 'Tartare de truite du lac du Bourget aux herbes fraîches et zestes de citron',
                    price: '14€'
                },
                {
                    title: 'Foie gras maison',
                    description: 'Foie gras de canard mi-cuit, chutney de figues et pain d\'épices',
                    price: '16€'
                }
            ],
            plats: [
                {
                    title: 'Suprême de volaille fermière',
                    description: 'Suprême de volaille fermière rôti, mousseline de céleri et jus réduit au thym',
                    price: '24€'
                },
                {
                    title: 'Omble chevalier',
                    description: 'Filet d\'omble chevalier, beurre blanc aux agrumes et légumes de saison',
                    price: '26€'
                },
                {
                    title: 'Filet de bœuf',
                    description: 'Filet de bœuf de Savoie, gratin dauphinois et sauce aux morilles',
                    price: '32€'
                }
            ],
            desserts: [
                {
                    title: 'Tarte aux myrtilles',
                    description: 'Tarte fine aux myrtilles sauvages et glace vanille',
                    price: '10€'
                },
                {
                    title: 'Fondant au chocolat',
                    description: 'Fondant au chocolat noir, cœur coulant et crème anglaise',
                    price: '11€'
                },
                {
                    title: 'Crème brûlée',
                    description: 'Crème brûlée à la vanille de Madagascar',
                    price: '9€'
                }
            ]
        };

        // Fonction pour créer un élément de plat
        function createDishElement(dish) {
            return `
                <div class="dish">
                    <div class="dish-info">
                        <h4>${dish.title}</h4>
                        <p>${dish.description}</p>
                    </div>
                    <div class="dish-price">${dish.price}</div>
                </div>
            `;
        }

        // Injecter les plats dans le DOM
        const categoriesContainer = document.getElementById('plats');
        
        if (categoriesContainer) {
            // Vider le conteneur
            categoriesContainer.innerHTML = '';
            
            // Entrées
            const entreesSection = document.createElement('div');
            entreesSection.className = 'category';
            entreesSection.innerHTML = `
                <h3>Entrées</h3>
                <div class="dishes">
                    ${dishes.entrees.map(dish => createDishElement(dish)).join('')}
                </div>
            `;
            categoriesContainer.appendChild(entreesSection);
            
            // Plats
            const platsSection = document.createElement('div');
            platsSection.className = 'category';
            platsSection.innerHTML = `
                <h3>Plats</h3>
                <div class="dishes">
                    ${dishes.plats.map(dish => createDishElement(dish)).join('')}
                </div>
            `;
            categoriesContainer.appendChild(platsSection);
            
            // Desserts
            const dessertsSection = document.createElement('div');
            dessertsSection.className = 'category';
            dessertsSection.innerHTML = `
                <h3>Desserts</h3>
                <div class="dishes">
                    ${dishes.desserts.map(dish => createDishElement(dish)).join('')}
                </div>
            `;
            categoriesContainer.appendChild(dessertsSection);
        }
    }

    // Fonction pour charger les menus depuis une API (simulée ici)
    function loadMenus() {
        // Simulation de données (à remplacer par un appel API)
        const menus = [
            {
                title: 'Menu Découverte',
                description: 'Entrée + Plat + Dessert',
                items: [
                    'Entrée au choix parmi la carte',
                    'Plat au choix parmi la carte',
                    'Dessert au choix parmi la carte'
                ],
                price: '38€'
            },
            {
                title: 'Menu Dégustation',
                description: 'Une expérience complète en 5 services',
                items: [
                    'Mise en bouche du Chef',
                    'Entrée signature',
                    'Poisson selon arrivage',
                    'Viande de nos régions',
                    'Dessert au choix'
                ],
                price: '58€'
            },
            {
                title: 'Menu du Midi',
                description: 'Du mardi au vendredi, hors jours fériés',
                items: [
                    'Entrée du jour',
                    'Plat du jour',
                    'Café gourmand'
                ],
                price: '25€'
            }
        ];

        // Injecter les menus dans le DOM
        const menusContainer = document.getElementById('menus');
        
        if (menusContainer) {
            // Vider le conteneur
            menusContainer.innerHTML = '';
            
            // Ajouter chaque menu
            menus.forEach(menu => {
                const menuElement = document.createElement('div');
                menuElement.className = 'menu-item';
                menuElement.innerHTML = `
                    <h3>${menu.title}</h3>
                    <p>${menu.description}</p>
                    <ul>
                        ${menu.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <div class="menu-price">${menu.price}</div>
                `;
                menusContainer.appendChild(menuElement);
            });
        }
    }

    // Charger les plats et menus au chargement de la page
    loadDishes();
    loadMenus();

    // Fonction pour charger les images de la galerie depuis une API (simulée ici)
    function loadGalleryImages() {
        // Simulation de données (à remplacer par un appel API)
        const images = [
            {
                src: 'img/placeholder-dish-1.jpg',
                title: 'Plat signature du Chef'
            },
            {
                src: 'img/placeholder-dish-2.jpg',
                title: 'Dessert aux fruits rouges'
            },
            {
                src: 'img/placeholder-dish-3.jpg',
                title: 'Entrée de saison'
            },
            {
                src: 'img/placeholder-dish-4.jpg',
                title: 'Poisson du lac'
            }
        ];

        // Injecter les images dans le DOM
        const galleryContainer = document.querySelector('.gallery-container');
        
        if (galleryContainer) {
            // Vider le conteneur
            galleryContainer.innerHTML = '';
            
            // Ajouter chaque image
            images.forEach(image => {
                const imageElement = document.createElement('div');
                imageElement.className = 'gallery-item';
                imageElement.innerHTML = `
                    <img src="${image.src}" alt="${image.title}">
                    <div class="gallery-overlay">
                        <h3>${image.title}</h3>
                    </div>
                `;
                galleryContainer.appendChild(imageElement);
            });
        }
    }

    // Charger les images de la galerie au chargement de la page
    loadGalleryImages();
}); 