// ProtectedRoute.jsx
import {Navigate} from 'react-router-dom';

export default function ProtectedRoute({isAuthenticated, children}) {

    if (!isAuthenticated) {
        // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
        return <Navigate to="/auth"/>;
    }

    // Si l'utilisateur est authentifié, afficher le composant enfant (par exemple, DashBoard)
    return children;
}
