const express = require('express');
const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// IMPORTER LES CONTRÔLEURS ET MIDDLEWARES
// ═══════════════════════════════════════════════════════════════

const {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    assignTicket,
    deleteTicket,
    getStats
} = require('../controllers/ticketController');

const { protect, authorize } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════
// ROUTES TICKETS
// ═══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// Route : /api/tickets
// ──────────────────────────────────────────────────────────────

router.route('/')
    // GET /api/tickets - Liste des tickets
    .get(protect, getTickets)
    // POST /api/tickets - Créer un ticket
    .post(protect, createTicket);

// ──────────────────────────────────────────────────────────────
// Route : /api/tickets/stats
// ──────────────────────────────────────────────────────────────

// ⚠️ IMPORTANT : Cette route DOIT être AVANT /api/tickets/:id
// Sinon "stats" sera interprété comme un ID
router.get('/stats', protect, getStats);

// ──────────────────────────────────────────────────────────────
// Route : /api/tickets/:id
// ──────────────────────────────────────────────────────────────

router.route('/:id')
    // GET /api/tickets/:id - Détails d'un ticket
    .get(protect, getTicket)
    // PUT /api/tickets/:id - Modifier un ticket
    .put(protect, updateTicket)
    // DELETE /api/tickets/:id - Supprimer (Manager seulement)
    .delete(protect, authorize('manager'), deleteTicket);

// ──────────────────────────────────────────────────────────────
// Route : /api/tickets/:id/assign
// ──────────────────────────────────────────────────────────────

// PUT /api/tickets/:id/assign - Assigner un ticket (Manager seulement)
router.put('/:id/assign', protect, authorize('manager'), assignTicket);

// ═══════════════════════════════════════════════════════════════
// EXPORTER LE ROUTER
// ═══════════════════════════════════════════════════════════════

module.exports = router;

// ═══════════════════════════════════════════════════════════════
// 💡 EXPLICATIONS
// ═══════════════════════════════════════════════════════════════

/*
1. SYNTAXE router.route() :
   Permet de chaîner plusieurs méthodes sur la même route
   
   router.route('/tickets')
     .get(getTickets)
     .post(createTicket)
   
   Équivalent à :
   router.get('/tickets', getTickets);
   router.post('/tickets', createTicket);

2. ORDRE DES ROUTES :
   ⚠️ /stats DOIT être AVANT /:id
   
   Correct :
   router.get('/stats', ...)     // Match "/stats"
   router.get('/:id', ...)        // Match "/123"
   
   Faux :
   router.get('/:id', ...)        // Match "/stats" (stats = ID)
   router.get('/stats', ...)      // Jamais exécuté

3. MIDDLEWARES :
   - protect : Vérifie le token JWT (toutes les routes)
   - authorize('manager') : Vérifie le rôle (routes spécifiques)
   
   Ordre d'exécution :
   protect → authorize → controller

4. PARAMÈTRES D'URL :
   /:id → req.params.id
   
   GET /api/tickets/123 → req.params.id = "123"

5. PERMISSIONS :
   - Toutes les routes : token requis (protect)
   - DELETE : Manager seulement
   - Assign : Manager seulement
   - Autres : Tous les utilisateurs authentifiés

6. URLS FINALES (avec préfixe /api/tickets) :
   GET    /api/tickets           → Liste
   POST   /api/tickets           → Créer
   GET    /api/tickets/stats     → Statistiques
   GET    /api/tickets/:id       → Détails
   PUT    /api/tickets/:id       → Modifier
   DELETE /api/tickets/:id       → Supprimer
   PUT    /api/tickets/:id/assign → Assigner
*/

// ═══════════════════════════════════════════════════════════════
// 📋 RÉCAPITULATIF DES ROUTES
// ═══════════════════════════════════════════════════════════════

/*
┌────────────────────────────────────────────────────────────────────────────┐
│ MÉTHODE │ URL                        │ ACCÈS         │ DESCRIPTION          │
├─────────┼────────────────────────────┼───────────────┼──────────────────────┤
│ GET     │ /api/tickets               │ Authentifié   │ Liste des tickets    │
│ POST    │ /api/tickets               │ Authentifié   │ Créer un ticket      │
│ GET     │ /api/tickets/stats         │ Authentifié   │ Statistiques         │
│ GET     │ /api/tickets/:id           │ Authentifié   │ Détails d'un ticket  │
│ PUT     │ /api/tickets/:id           │ Authentifié   │ Modifier un ticket   │
│ DELETE  │ /api/tickets/:id           │ Manager       │ Supprimer un ticket  │
│ PUT     │ /api/tickets/:id/assign    │ Manager       │ Assigner un ticket   │
└────────────────────────────────────────────────────────────────────────────┘
*/