document.addEventListener('DOMContentLoaded', function() {
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

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Vérifier les identifiants
            const admin = JSON.parse(localStorage.getItem('admin'));
            if (admin && admin.email === email && admin.password === password) {
                const currentUser = {
                    ...admin,
                    isAdmin: true
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.location.href = 'admin.html';
            } else {
                showNotification('Email ou mot de passe incorrect', 'error');
            }
        });
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
}); 