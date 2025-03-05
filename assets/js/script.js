document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let plats = JSON.parse(localStorage.getItem("plats")) || [];
    let menus = JSON.parse(localStorage.getItem("menus")) || [];
    let horaires = JSON.parse(localStorage.getItem("horaires")) || [];
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

    // Gestion de l'authentification
    function checkAdminAuth() {
        if (!localStorage.getItem("adminLoggedIn")) {
            alert("Accès refusé. Veuillez vous connecter.");
            window.location.href = "login.html";
        }
    }
    checkAdminAuth();

    function logout() {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login.html";
    }
    document.getElementById("logoutBtn").addEventListener("click", logout);

    // Gestion des horaires
    function saveHoraires() {
        localStorage.setItem("horaires", JSON.stringify(horaires));
    }

    function ajouterHoraire(jour, ouverture, fermeture) {
        horaires.push({ jour, ouverture, fermeture });
        saveHoraires();
    }

    function supprimerHoraire(index) {
        horaires.splice(index, 1);
        saveHoraires();
    }

    // Gestion des catégories
    function saveCategories() {
        localStorage.setItem("categories", JSON.stringify(categories));
    }

    function ajouterCategorie(nom) {
        categories.push({ nom });
        saveCategories();
    }

    function supprimerCategorie(index) {
        categories.splice(index, 1);
        saveCategories();
    }

    // Gestion des plats
    function savePlats() {
        localStorage.setItem("plats", JSON.stringify(plats));
    }

    function ajouterPlat(nom, description, prix, categorie) {
        plats.push({ nom, description, prix, categorie });
        savePlats();
    }

    function supprimerPlat(index) {
        plats.splice(index, 1);
        savePlats();
    }

    // Gestion des menus
    function saveMenus() {
        localStorage.setItem("menus", JSON.stringify(menus));
    }

    function ajouterMenu(titre, description, platsInclus, prix) {
        menus.push({ titre, description, platsInclus, prix });
        saveMenus();
    }

    function supprimerMenu(index) {
        menus.splice(index, 1);
        saveMenus();
    }

    // Gestion des réservations
    function saveReservations() {
        localStorage.setItem("reservations", JSON.stringify(reservations));
    }

    function modifierReservation(index, statut) {
        reservations[index].statut = statut;
        saveReservations();
    }

    function supprimerReservation(index) {
        reservations.splice(index, 1);
        saveReservations();
    }

    // Gestion de la galerie d'images
    function ajouterImage(imageData) {
        let galerie = JSON.parse(localStorage.getItem("galerie")) || [];
        galerie.push({ imageData });
        localStorage.setItem("galerie", JSON.stringify(galerie));
    }

    function supprimerImage(index) {
        let galerie = JSON.parse(localStorage.getItem("galerie")) || [];
        galerie.splice(index, 1);
        localStorage.setItem("galerie", JSON.stringify(galerie));
    }

    // Tableau de bord
    function afficherStatistiques() {
        let totalReservations = reservations.length;
        let reservationsConfirmees = reservations.filter(r => r.statut === "confirmée").length;
        let tauxOccupation = totalReservations ? (reservationsConfirmees / totalReservations * 100).toFixed(2) : 0;

        document.getElementById("statTotalReservations").innerText = totalReservations;
        document.getElementById("statReservationsConfirmees").innerText = reservationsConfirmees;
        document.getElementById("statTauxOccupation").innerText = tauxOccupation + "%";
    }

    afficherStatistiques();

    // Gestion des modales
    function ouvrirModale(id) {
        document.getElementById(id).classList.add("open");
    }

    function fermerModale(id) {
        document.getElementById(id).classList.remove("open");
    }
});
