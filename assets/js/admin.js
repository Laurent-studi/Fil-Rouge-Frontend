document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentSection = 'dashboard';
    let currentModal = null;
    let editingItemId = null;
    
    // Données temporaires (simulation de base de données)
    const defaultHoraires = [
        { jour: 'Lundi', midi_ouverture: '', midi_fermeture: '', soir_ouverture: '', soir_fermeture: '', ferme: true },
        { jour: 'Mardi', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false },
        { jour: 'Mercredi', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false },
        { jour: 'Jeudi', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false },
        { jour: 'Vendredi', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false },
        { jour: 'Samedi', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false },
        { jour: 'Dimanche', midi_ouverture: '12:00', midi_fermeture: '14:00', soir_ouverture: '19:00', soir_fermeture: '21:00', ferme: false }
    ];

    // Initialisation de l'administrateur par défaut
    const defaultAdmin = {
        email: 'admin@lequaiantique.fr',
        password: 'Admin123!',
        prenom: 'Arnaud',
        nom: 'Michant',
        role: 'admin'
    };

    // Vérifier si l'administrateur existe déjà, sinon le créer
    if (!localStorage.getItem('admin')) {
        localStorage.setItem('admin', JSON.stringify(defaultAdmin));
    }

    // Initialisation des données
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const plats = JSON.parse(localStorage.getItem('plats')) || [];
    const menus = JSON.parse(localStorage.getItem('menus')) || [];

    // ===== INITIALISATION =====
    
    function init() {
        // Vérifier l'authentification
        checkAuth();
        
        // Charger les données initiales
        loadHoraires();
        afficherCategories();
        afficherPlats();
        afficherMenus();
        
        // Initialiser les fonctionnalités additionnelles
        initAdditional();
        
        // Ajouter les écouteurs d'événements
        setupEventListeners();
        setupAdditionalEventListeners();
        
        // Afficher la section par défaut
        showSection(currentSection);
    }

    // ===== AUTHENTIFICATION =====

    function checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser || !currentUser.isAdmin) {
            location.href = 'index.html';
            return;
        }
        
        // Mettre à jour l'interface avec le nom de l'admin
        const userInfoElement = document.querySelector('.user-info');
        if (userInfoElement) {
            userInfoElement.textContent = `${currentUser.prenom} ${currentUser.nom}`;
        }
    }

    function login(email, password) {
        const admin = JSON.parse(localStorage.getItem('admin'));
        
        if (admin && admin.email === email && admin.password === password) {
            localStorage.setItem('adminUser', JSON.stringify(admin));
            window.location.href = 'admin.html';
            return true;
        }
        
        showNotification('Email ou mot de passe incorrect', 'error');
        return false;
    }

    function logout() {
        localStorage.removeItem('currentUser');
        location.href = 'index.html';
    }

    // ===== GESTION DES ÉVÉNEMENTS =====

    function setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.admin-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = this.getAttribute('data-section');
                showSection(targetSection);
            });
        });

        // Gestion des onglets dans la section carte
        const tabButtons = document.querySelectorAll('.admin-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                
                // Désactiver tous les onglets et contenus
                document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
                
                // Activer l'onglet et le contenu sélectionnés
                this.classList.add('active');
                document.getElementById(target)?.classList.add('active');
            });
        });

        // Bouton de déconnexion
        const logoutBtn = document.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Formulaire des horaires
        const horaireForm = document.querySelector('#horaire-form');
        if (horaireForm) {
            horaireForm.addEventListener('submit', saveHoraires);
        }

        // Checkboxes "Fermé"
        const fermeCheckboxes = document.querySelectorAll('.ferme-checkbox');
        fermeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', toggleHoraireInputs);
        });

        // Formulaires de gestion du contenu
        document.getElementById('form-categorie')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const nom = document.getElementById('nom-categorie').value;
            ajouterCategorie(nom);
            this.reset();
        });

        document.getElementById('form-plat')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const nom = document.getElementById('nom-plat').value;
            const description = document.getElementById('desc-plat').value;
            const prix = document.getElementById('prix-plat').value;
            const categorieId = parseInt(document.getElementById('categorie-plat').value);
            ajouterPlat(nom, description, prix, categorieId);
            this.reset();
        });

        document.getElementById('form-menu')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const titre = document.getElementById('titre-menu').value;
            const description = document.getElementById('desc-menu').value;
            const prix = document.getElementById('prix-menu').value;
            const platsIds = Array.from(document.querySelectorAll('input[name="plats-menu"]:checked')).map(input => parseInt(input.value));
            ajouterMenu(titre, description, platsIds, prix);
            this.reset();
        });

        // Ajouter l'écouteur d'événements pour le formulaire de connexion
        const loginForm = document.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.querySelector('#email').value;
                const password = document.querySelector('#password').value;
                login(email, password);
            });
        }
    }

    // ===== NAVIGATION =====

    function showSection(sectionId) {
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.querySelector(`#${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionId;
            
            const navLinks = document.querySelectorAll('.admin-nav a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    }

    // ===== GESTION DES HORAIRES =====
    
    function loadHoraires() {
        const horaireSection = document.querySelector('#horaires');
        if (!horaireSection) return; // Si la section horaires n'existe pas, on sort de la fonction

        let horaires = JSON.parse(localStorage.getItem('horaires')) || defaultHoraires;
        
        horaires.forEach(horaire => {
            const jour = horaire.jour.toLowerCase();
            
            const midiOuverture = document.querySelector(`#${jour}-midi-ouverture`);
            const midiFermeture = document.querySelector(`#${jour}-midi-fermeture`);
            const soirOuverture = document.querySelector(`#${jour}-soir-ouverture`);
            const soirFermeture = document.querySelector(`#${jour}-soir-fermeture`);
            const fermeCheckbox = document.querySelector(`#${jour}-ferme`);
            
            if (midiOuverture) midiOuverture.value = horaire.midi_ouverture;
            if (midiFermeture) midiFermeture.value = horaire.midi_fermeture;
            if (soirOuverture) soirOuverture.value = horaire.soir_ouverture;
            if (soirFermeture) soirFermeture.value = horaire.soir_fermeture;
            
            if (fermeCheckbox) {
                fermeCheckbox.checked = horaire.ferme;
                if (horaire.ferme) {
                    toggleHoraireInputs({ target: fermeCheckbox });
                }
            }
        });
    }

    function saveHoraires(e) {
        e.preventDefault();
        
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const horaires = [];
        
        jours.forEach(jour => {
            const jourCapitalized = jour.charAt(0).toUpperCase() + jour.slice(1);
            const ferme = document.querySelector(`#${jour}-ferme`).checked;
            
            horaires.push({
                jour: jourCapitalized,
                midi_ouverture: document.querySelector(`#${jour}-midi-ouverture`).value,
                midi_fermeture: document.querySelector(`#${jour}-midi-fermeture`).value,
                soir_ouverture: document.querySelector(`#${jour}-soir-ouverture`).value,
                soir_fermeture: document.querySelector(`#${jour}-soir-fermeture`).value,
                ferme: ferme
            });
        });
        
        localStorage.setItem('horaires', JSON.stringify(horaires));
        showNotification('Les horaires ont été mis à jour avec succès', 'success');
    }

    function toggleHoraireInputs(e) {
        const checkbox = e.target;
        const jour = checkbox.id.split('-')[0];
        const inputs = [
            document.querySelector(`#${jour}-midi-ouverture`),
            document.querySelector(`#${jour}-midi-fermeture`),
            document.querySelector(`#${jour}-soir-ouverture`),
            document.querySelector(`#${jour}-soir-fermeture`)
        ];
        
        inputs.forEach(input => {
            input.disabled = checkbox.checked;
            if (checkbox.checked) input.value = '';
        });
    }

    // ===== GESTION DES CATÉGORIES =====

    function ajouterCategorie(nom) {
        if (!nom.trim()) return alert('Le nom de la catégorie est requis.');
        categories.push({ id: Date.now(), nom });
        localStorage.setItem('categories', JSON.stringify(categories));
        afficherCategories();
        showNotification('Catégorie ajoutée avec succès', 'success');
    }

    function supprimerCategorie(id) {
        const index = categories.findIndex(c => c.id === id);
        if (index > -1) {
            categories.splice(index, 1);
            localStorage.setItem('categories', JSON.stringify(categories));
            afficherCategories();
            showNotification('Catégorie supprimée avec succès', 'success');
        }
    }

    function afficherCategories() {
        const container = document.getElementById('liste-categories');
        if (!container) return;
        
        container.innerHTML = categories.map(cat => `
            <li>${cat.nom} <button onclick="supprimerCategorie(${cat.id})">❌</button></li>
        `).join('');
    }

    // ===== GESTION DES PLATS =====

    function ajouterPlat(nom, description, prix, categorieId) {
        if (!nom.trim() || !description.trim() || !prix || !categorieId) 
            return alert('Tous les champs sont obligatoires.');
        
        plats.push({ 
            id: Date.now(), 
            nom, 
            description, 
            prix: parseFloat(prix), 
            categorieId 
        });
        
        localStorage.setItem('plats', JSON.stringify(plats));
        afficherPlats();
        showNotification('Plat ajouté avec succès', 'success');
    }

    function supprimerPlat(id) {
        const index = plats.findIndex(p => p.id === id);
        if (index > -1) {
            plats.splice(index, 1);
            localStorage.setItem('plats', JSON.stringify(plats));
            afficherPlats();
            showNotification('Plat supprimé avec succès', 'success');
        }
    }

    function afficherPlats() {
        const container = document.getElementById('liste-plats');
        if (!container) return;

        container.innerHTML = plats.map(plat => {
            const categorie = categories.find(c => c.id === plat.categorieId)?.nom || 'Non catégorisé';
            return `
                <li>
                    ${plat.nom} - ${plat.description} (${plat.prix}€) 
                    [${categorie}] 
                    <button onclick="supprimerPlat(${plat.id})">❌</button>
                </li>`;
        }).join('');
    }

    // ===== GESTION DES MENUS =====

    function ajouterMenu(titre, description, platsIds, prix) {
        if (!titre.trim() || !description.trim() || !platsIds.length || !prix) 
            return alert('Tous les champs sont obligatoires.');
        
        menus.push({ 
            id: Date.now(), 
            titre, 
            description, 
            platsIds, 
            prix: parseFloat(prix) 
        });
        
        localStorage.setItem('menus', JSON.stringify(menus));
        afficherMenus();
        showNotification('Menu ajouté avec succès', 'success');
    }

    function supprimerMenu(id) {
        const index = menus.findIndex(m => m.id === id);
        if (index > -1) {
            menus.splice(index, 1);
            localStorage.setItem('menus', JSON.stringify(menus));
            afficherMenus();
            showNotification('Menu supprimé avec succès', 'success');
        }
    }

    function afficherMenus() {
        const container = document.getElementById('liste-menus');
        if (!container) return;

        container.innerHTML = menus.map(menu => {
            const platsNoms = menu.platsIds
                .map(id => plats.find(p => p.id === id)?.nom || 'Plat inconnu')
                .join(', ');
            return `
                <li>
                    ${menu.titre} - ${menu.description} (${menu.prix}€)
                    [Plats: ${platsNoms}]
                    <button onclick="supprimerMenu(${menu.id})">❌</button>
                </li>`;
        }).join('');
    }

    // ===== GESTION DES STATISTIQUES =====
    
    function afficherStatistiques() {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const totalReservations = reservations.length;
        const reservationsConfirmees = reservations.filter(r => r.statut === "confirmée").length;
        const tauxOccupation = totalReservations ? 
            (reservationsConfirmees / totalReservations * 100).toFixed(2) : 0;

        const stats = {
            'total-reservations': totalReservations,
            'reservations-confirmees': reservationsConfirmees,
            'taux-occupation': `${tauxOccupation}%`,
            'plats-disponibles': plats.length,
            'menus-disponibles': menus.length
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.querySelector(`#${id}`);
            if (element) element.textContent = value;
        });
    }

    // ===== GESTION DES RÉSERVATIONS =====

    function chargerReservations() {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const container = document.querySelector('#liste-reservations');
        if (!container) return;

        container.innerHTML = reservations.map((reservation, index) => `
            <div class="reservation-item ${reservation.statut}">
                <div class="reservation-info">
                    <p><strong>Client:</strong> ${reservation.nom} ${reservation.prenom}</p>
                    <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</p>
                    <p><strong>Heure:</strong> ${reservation.heure}</p>
                    <p><strong>Couverts:</strong> ${reservation.couverts}</p>
                    <p><strong>Statut:</strong> ${reservation.statut}</p>
                    ${reservation.allergies ? `<p><strong>Allergies:</strong> ${reservation.allergies}</p>` : ''}
                </div>
                <div class="reservation-actions">
                    <button onclick="modifierStatutReservation(${index}, 'confirmée')" 
                            class="btn-success" ${reservation.statut === 'confirmée' ? 'disabled' : ''}>
                        Confirmer
                    </button>
                    <button onclick="modifierStatutReservation(${index}, 'annulée')"
                            class="btn-danger" ${reservation.statut === 'annulée' ? 'disabled' : ''}>
                        Annuler
                    </button>
                </div>
            </div>
        `).join('');
    }

    function modifierStatutReservation(index, nouveauStatut) {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        if (reservations[index]) {
            reservations[index].statut = nouveauStatut;
            localStorage.setItem('reservations', JSON.stringify(reservations));
            chargerReservations();
            afficherStatistiques();
            showNotification(`Réservation ${nouveauStatut}`, 'success');
        }
    }

    // ===== GESTION DE LA GALERIE =====

    function chargerGalerie() {
        const galerie = JSON.parse(localStorage.getItem('galerie')) || [];
        const container = document.querySelector('#liste-galerie');
        if (!container) return;

        container.innerHTML = galerie.map((image, index) => `
            <div class="galerie-item">
                <img src="${image.url}" alt="${image.titre || 'Image de la galerie'}">
                <div class="galerie-item-info">
                    <h4>${image.titre || 'Sans titre'}</h4>
                    <p>${image.description || ''}</p>
                    <button onclick="supprimerImage(${index})" class="btn-danger">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    function ajouterImage(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const imageData = {
            titre: formData.get('titre'),
            description: formData.get('description'),
            url: formData.get('url')
        };

        const galerie = JSON.parse(localStorage.getItem('galerie')) || [];
        galerie.push(imageData);
        localStorage.setItem('galerie', JSON.stringify(galerie));
        
        chargerGalerie();
        showNotification('Image ajoutée avec succès', 'success');
        event.target.reset();
    }

    function supprimerImage(index) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

        const galerie = JSON.parse(localStorage.getItem('galerie')) || [];
        galerie.splice(index, 1);
        localStorage.setItem('galerie', JSON.stringify(galerie));
        
        chargerGalerie();
        showNotification('Image supprimée avec succès', 'success');
    }

    // ===== GESTION DES NOTIFICATIONS =====

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

    // ===== INITIALISATION ADDITIONNELLE =====

    function setupAdditionalEventListeners() {
        const formGalerie = document.querySelector('#form-galerie');
        if (formGalerie) {
            formGalerie.addEventListener('submit', ajouterImage);
        }

        const filtreDate = document.querySelector('#filtre-date');
        if (filtreDate) {
            filtreDate.addEventListener('change', () => {
                chargerReservations();
            });
        }
    }

    function initAdditional() {
        afficherStatistiques();
        chargerReservations();
        chargerGalerie();
    }

    // Démarrer l'application
    init();
});

// Fonctions globales
window.supprimerCategorie = function(id) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const index = categories.findIndex(c => c.id === id);
    if (index > -1) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        afficherCategories();
        showNotification('Catégorie supprimée avec succès', 'success');
    }
};

window.supprimerPlat = function(id) {
    const plats = JSON.parse(localStorage.getItem('plats')) || [];
    const index = plats.findIndex(p => p.id === id);
    if (index > -1) {
        plats.splice(index, 1);
        localStorage.setItem('plats', JSON.stringify(plats));
        afficherPlats();
        showNotification('Plat supprimé avec succès', 'success');
    }
};

window.supprimerMenu = function(id) {
    const menus = JSON.parse(localStorage.getItem('menus')) || [];
    const index = menus.findIndex(m => m.id === id);
    if (index > -1) {
        menus.splice(index, 1);
        localStorage.setItem('menus', JSON.stringify(menus));
        afficherMenus();
        showNotification('Menu supprimé avec succès', 'success');
    }
};

window.modifierStatutReservation = function(index, nouveauStatut) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    if (reservations[index]) {
        reservations[index].statut = nouveauStatut;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        chargerReservations();
        afficherStatistiques();
        showNotification(`Réservation ${nouveauStatut}`, 'success');
    }
};

window.supprimerImage = function(index) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    const galerie = JSON.parse(localStorage.getItem('galerie')) || [];
    galerie.splice(index, 1);
    localStorage.setItem('galerie', JSON.stringify(galerie));
    
    chargerGalerie();
    showNotification('Image supprimée avec succès', 'success');
};

window.showNotification = function(message, type = 'info') {
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
};

window.afficherCategories = function() {
    const container = document.getElementById('liste-categories');
    if (!container) return;
    
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    container.innerHTML = categories.map(cat => `
        <li>${cat.nom} <button onclick="supprimerCategorie(${cat.id})">❌</button></li>
    `).join('');
};

window.afficherPlats = function() {
    const container = document.getElementById('liste-plats');
    if (!container) return;

    const plats = JSON.parse(localStorage.getItem('plats')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];

    container.innerHTML = plats.map(plat => {
        const categorie = categories.find(c => c.id === plat.categorieId)?.nom || 'Non catégorisé';
        return `
            <li>
                ${plat.nom} - ${plat.description} (${plat.prix}€) 
                [${categorie}] 
                <button onclick="supprimerPlat(${plat.id})">❌</button>
            </li>`;
    }).join('');
};

window.afficherMenus = function() {
    const container = document.getElementById('liste-menus');
    if (!container) return;

    const menus = JSON.parse(localStorage.getItem('menus')) || [];
    const plats = JSON.parse(localStorage.getItem('plats')) || [];

    container.innerHTML = menus.map(menu => {
        const platsNoms = menu.platsIds
            .map(id => plats.find(p => p.id === id)?.nom || 'Plat inconnu')
            .join(', ');
        return `
            <li>
                ${menu.titre} - ${menu.description} (${menu.prix}€)
                [Plats: ${platsNoms}]
                <button onclick="supprimerMenu(${menu.id})">❌</button>
            </li>`;
    }).join('');
};

window.chargerGalerie = function() {
    const galerie = JSON.parse(localStorage.getItem('galerie')) || [];
    const container = document.querySelector('#liste-galerie');
    if (!container) return;

    container.innerHTML = galerie.map((image, index) => `
        <div class="galerie-item">
            <img src="${image.url}" alt="${image.titre || 'Image de la galerie'}">
            <div class="galerie-item-info">
                <h4>${image.titre || 'Sans titre'}</h4>
                <p>${image.description || ''}</p>
                <button onclick="supprimerImage(${index})" class="btn-danger">Supprimer</button>
            </div>
        </div>
    `).join('');
};

window.chargerReservations = function() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const container = document.querySelector('#liste-reservations');
    if (!container) return;

    container.innerHTML = reservations.map((reservation, index) => `
        <div class="reservation-item ${reservation.statut}">
            <div class="reservation-info">
                <p><strong>Client:</strong> ${reservation.nom} ${reservation.prenom}</p>
                <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</p>
                <p><strong>Heure:</strong> ${reservation.heure}</p>
                <p><strong>Couverts:</strong> ${reservation.couverts}</p>
                <p><strong>Statut:</strong> ${reservation.statut}</p>
                ${reservation.allergies ? `<p><strong>Allergies:</strong> ${reservation.allergies}</p>` : ''}
            </div>
            <div class="reservation-actions">
                <button onclick="modifierStatutReservation(${index}, 'confirmée')" 
                        class="btn-success" ${reservation.statut === 'confirmée' ? 'disabled' : ''}>
                    Confirmer
                </button>
                <button onclick="modifierStatutReservation(${index}, 'annulée')"
                        class="btn-danger" ${reservation.statut === 'annulée' ? 'disabled' : ''}>
                    Annuler
                </button>
            </div>
        </div>
    `).join('');
};
