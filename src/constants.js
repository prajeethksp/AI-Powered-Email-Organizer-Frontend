const DEV_BACKEND_URL = 'http://localhost:5050'
const DEV_FRONTEND_URL = 'http://localhost:3001'
const PROD_BACKEND_URL = 'https://api.emailorganizersummer2024.com'
const PROD_FRONTEND_URL = 'https://emailorganizersummer2024.com'
//
export const BACKEND_URL = window.location.href.includes('://localhost') ? DEV_BACKEND_URL : PROD_BACKEND_URL
export const FRONTEND_URL = window.location.href.includes('://localhost') ? DEV_FRONTEND_URL : PROD_FRONTEND_URL
export const currentUser = () => localStorage['EmailOrganizerCurrentUser'] && JSON.parse(localStorage['EmailOrganizerCurrentUser'])
export const logout = () => {
    localStorage.removeItem('EmailOrganizerCurrentUser')
    window.location.pathname='/'
}

export const GOOGLE_AUTH_REDIRECT_URI =  window.location.href.includes('://localhost') ? 'http://localhost:3000/dashboard' : 'https://emailorganizersummer2024.com/dashboard'